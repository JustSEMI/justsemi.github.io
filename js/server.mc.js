async function muatStatusServer() {
    try {
      const res = await fetch("https://api.mcsrvstat.us/2/dma.luckystore.id:25615");
      const data = await res.json();

      if (!data.online) {
        document.getElementById("motd").innerHTML = "🔴 Server sedang offline.";
        return;
      }

      const motdHTML = data.motd && data.motd.html ? data.motd.html.join("<br>") : "Tidak ada MOTD.";
      document.getElementById("motd").innerHTML = `🟢 ${motdHTML}`;

      document.getElementById("players").innerText = `👥 ${data.players.online} / ${data.players.max} pemain online`;

      document.getElementById("version").innerText = `🔧 Versi: ${data.version || "tidak diketahui"}`;

    } catch (err) {
      document.getElementById("motd").innerText = "❌ Gagal memuat status server.";
    }
  }

  muatStatusServer();

  setInterval(muatStatusServer, 10000);