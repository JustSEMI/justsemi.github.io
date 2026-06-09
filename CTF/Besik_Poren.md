# Writeup CTF - Besik_Poren

## Deskripsi Tantangan
Tantangan kategori Forensik dengan nama **Besik_Poren** (Easy, 50 poin). Deskripsi tantangan menyebutkan bahwa pembuat tantangan tidak memiliki kuota internet, sehingga pengiriman file dilakukan seperti pada tahun 2015 (menggunakan Bluetooth). File tantangan yang disediakan bernama `dist`.

---

## Langkah Penyelesaian

### 1. Analisis Awal File `dist`
Langkah pertama adalah memeriksa jenis file dari `dist` dengan membaca magic bytes (header file) menggunakan script Python berikut:

```python
with open('dist', 'rb') as f:
    print(f.read(16))
```

Hasil pembacaan 16 byte pertama:
`b'btsnoop\x00\x00\x00\x00\x01\x00\x00\x03\xea'`


Magic bytes `btsnoop\x00` menunjukkan bahwa file tersebut adalah **Bluetooth HCI Snoop Log** (Format pcap khusus Bluetooth).

---

### 2. Menganalisis Protokol dan Ekstraksi Stream
Di dalam log Bluetooth tersebut terdapat aktivitas transfer file. Protokol standar yang digunakan untuk transfer file via Bluetooth adalah **OBEX (Object Exchange)** yang berjalan di atas **RFCOMM** dan **L2CAP**.

Kami membuat script parser Python untuk melakukan langkah-langkah berikut:
1. Melakukan reassembly pada fragmen-fragmen paket L2CAP.
2. Melacak koneksi RFCOMM (PSM `0x03`) pada DLCI 8 (saluran data pengguna).
3. Membaca data RFCOMM dengan memperhatikan credit-based flow control (jika control byte bernilai `0xff`, maka terdapat 1-byte credit tambahan sebelum payload).
4. Menyusun kembali stream payload OBEX PUT.

Berikut adalah script Python yang digunakan (`parse_btsnoop.py`):

```python
import struct

def parse_btsnoop_and_extract_file(file_path):
    with open(file_path, 'rb') as f:
        file_header = f.read(16)
        if len(file_header) < 16:
            return
        
        magic, version, datalink = struct.unpack('>8sII', file_header)
        
        active_rx = {}
        active_tx = {}
        cid_to_psm = {}
        l2cap_packets = []
        
        while True:
            header_bytes = f.read(24)
            if len(header_bytes) < 24:
                break
            
            orig_len, incl_len, flags, dropped, ts = struct.unpack('>IIIIQ', header_bytes)
            payload = f.read(incl_len)
            
            if len(payload) == 0:
                continue
            
            h4_type = payload[0]
            if h4_type != 2: # HCI ACL Data
                continue
            
            acl_data = payload[1:]
            if len(acl_data) < 4:
                continue
                
            handle_flags, total_len = struct.unpack('<HH', acl_data[:4])
            handle = handle_flags & 0x0FFF
            pb_flag = (handle_flags >> 12) & 0x03
            data = acl_data[4:4+total_len]
            
            direction = "Rx" if (flags & 1) else "Tx"
            reassembly_key = (direction, handle)
            
            if pb_flag == 2 or pb_flag == 0: # Start of L2CAP packet
                if len(data) >= 4:
                    l2cap_len, cid = struct.unpack('<HH', data[:4])
                    l2cap_payload = data[4:]
                    if len(l2cap_payload) >= l2cap_len:
                        l2cap_packets.append((direction, handle, cid, l2cap_payload[:l2cap_len]))
                    else:
                        active_rx[reassembly_key] = (cid, l2cap_len, l2cap_payload)
            elif pb_flag == 1: # Fragment
                if reassembly_key in active_rx:
                    cid, l2cap_len, accumulated = active_rx[reassembly_key]
                    accumulated += data
                    if len(accumulated) >= l2cap_len:
                        l2cap_packets.append((direction, handle, cid, accumulated[:l2cap_len]))
                        del active_rx[reassembly_key]
                    else:
                        active_rx[reassembly_key] = (cid, l2cap_len, accumulated)

        for direction, handle, cid, payload in l2cap_packets:
            if cid == 1: # Signaling
                if len(payload) >= 4:
                    code, ident, length = struct.unpack('<BBH', payload[:4])
                    sig_data = payload[4:4+length]
                    if code == 2: # Connection Request
                        psm, scid = struct.unpack('<HH', sig_data[:4])
                        cid_to_psm[(direction, handle, scid)] = psm
                    elif code == 3: # Connection Response
                        dcid, scid, result, status = struct.unpack('<HHHH', sig_data[:8])
                        opp_direction = "Rx" if direction == "Tx" else "Tx"
                        psm = cid_to_psm.get((opp_direction, handle, scid), None)
                        if psm is not None:
                            cid_to_psm[(direction, handle, dcid)] = psm
                            cid_to_psm[(opp_direction, handle, scid)] = psm
        
        rfcomm_stream = bytearray()
        for direction, handle, cid, payload in l2cap_packets:
            psm = cid_to_psm.get((direction, handle, cid), None)
            if psm == 3 and direction == "Tx": # RFCOMM data
                if len(payload) < 4:
                    continue
                addr = payload[0]
                control = payload[1]
                dlci = addr >> 2
                
                if dlci == 8 and (control in (0xef, 0xff)):
                    has_credit = (control == 0xff)
                    len_byte1 = payload[2]
                    if (len_byte1 & 1) == 1:
                        rfcomm_len = len_byte1 >> 1
                        data_start = 4 if has_credit else 3
                    else:
                        len_byte2 = payload[3]
                        rfcomm_len = (len_byte1 >> 1) + (len_byte2 << 7)
                        data_start = 5 if has_credit else 4
                    
                    rfcomm_data = payload[data_start : data_start + rfcomm_len]
                    rfcomm_stream.extend(rfcomm_data)
        
        if len(rfcomm_stream) >= 3:
            stream_idx = 0
            while stream_idx < len(rfcomm_stream):
                if stream_idx + 3 > len(rfcomm_stream):
                    break
                opcode, obex_len = struct.unpack('>BH', rfcomm_stream[stream_idx:stream_idx+3])
                packet_data = rfcomm_stream[stream_idx : stream_idx + obex_len]
                
                header_start = 7 if opcode == 0x80 else 3
                idx = header_start
                body_data = bytearray()
                file_name = "extracted_file"
                
                while idx < len(packet_data):
                    if idx + 1 > len(packet_data):
                        break
                    header_id = packet_data[idx]
                    header_type = header_id >> 6
                    
                    if header_type in (0, 1):
                        if idx + 3 > len(packet_data):
                            break
                        header_len = struct.unpack('>H', packet_data[idx+1:idx+3])[0]
                        value = packet_data[idx+3 : idx+header_len]
                        
                        if header_id == 0x01: # Name
                            file_name = value.decode('utf-16be').rstrip('\x00')
                        elif header_id in (0x48, 0x49): # Body/End of Body
                            body_data.extend(value)
                        idx += header_len
                    elif header_type == 2:
                        idx += 2
                    elif header_type == 3:
                        idx += 5
                
                if len(body_data) > 0:
                    with open(file_name, 'wb') as out_f:
                        out_f.write(body_data)
                    print(f"File {file_name} extracted.")
                stream_idx += obex_len

if __name__ == '__main__':
    parse_btsnoop_and_extract_file('dist')
```


Dari parsing OBEX PUT tersebut, terdeteksi metadata transfer sebagai berikut:
- **Nama File**: `chall.pdf`
- **Tipe Konten**: `application/pdf`
- **Ukuran Body**: 3102 byte

Setelah diekstrak, data biner file tersebut disimpan ke `chall.pdf`.

---

### 3. Pemeriksaan File Hasil Ekstraksi
Ketika file `chall.pdf` diperiksa biner atau magic bytes-nya, ditemukan signature `PK\x03\x04` pada awal file. Signature ini menandakan bahwa file tersebut sebenarnya adalah file **ZIP**, bukan PDF asli.

Daftar file di dalam arsip ZIP tersebut adalah:
- `flag.txt` (Terenkripsi)
- `rahasia_programmer.txt` (Terenkripsi)
- `.secret` (Tidak Terenkripsi)

---

### 4. Membuka Proteksi ZIP
Karena file `.secret` tidak terenkripsi, file tersebut dapat langsung diekstrak tanpa password.
Isi dari file `.secret` adalah:
`poltec_soehat`

String `poltec_soehat` digunakan sebagai password untuk mengekstrak file `flag.txt` dan `rahasia_programmer.txt`. Proses ekstraksi berhasil sepenuhnya.

Berikut adalah script Python yang digunakan untuk mengekstrak ZIP tersebut:

```python
import zipfile

# Buka file ZIP yang menyamar sebagai PDF
with zipfile.ZipFile('chall.pdf') as z:
    # Ekstrak file .secret yang tidak terenkripsi
    z.extract('.secret', 'extracted_zip')
    
    # Ekstrak seluruh file menggunakan password dari .secret
    z.extractall('extracted_zip', pwd=b'poltec_soehat')
```


---

### 5. Mendapatkan Flag
Di dalam file `flag.txt` yang berhasil diekstrak, ditemukan flag untuk tantangan ini.
