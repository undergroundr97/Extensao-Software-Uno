const map = L.map('map').setView([0, 0], 13);
db.collection("marcadores").get().then((querySnapshot) => {
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const marker = L.marker([data.lat, data.lng]).addTo(map);
      marker.bindPopup(`
        <strong>Problema:</strong> ${data.tipo}<br>
        <strong>Local:</strong> ${data.lat.toFixed(5)}, ${data.lng.toFixed(5)}
      `);
    });
  });
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap contributors',
  maxZoom: 19
}).addTo(map);

// Centraliza no usuário
if (navigator.geolocation) {
  navigator.geolocation.getCurrentPosition(function(position) {
    const lat = position.coords.latitude;
    const lng = position.coords.longitude;
    map.setView([lat, lng], 15);
    L.marker([lat, lng]).addTo(map).bindPopup("Você está aqui").openPopup();
  });
}

// Clique no mapa para adicionar marcador
map.on("click", function (e) {
  const coords = e.latlng;
  const uniqueId = Date.now();

  const marker = L.marker(coords).addTo(map);

  const popupHTML = `
    <div id="popup-${uniqueId}">
      <div id="form-${uniqueId}">
        <label>Tipo de problema:</label><br>
        <select id="select-${uniqueId}">
          <option value="buraco">Buraco</option>
          <option value="lixo">Lixo acumulado</option>
          <option value="iluminacao">Falta de iluminação</option>
          <option value="outro">Outro</option>
        </select><br><br>
        <button id="btn-${uniqueId}">Salvar Problema</button>
      </div>
      <div id="resumo-${uniqueId}" style="display:none;">
        <p><strong>Problema:</strong> <span id="tipo-${uniqueId}"></span></p>
        <p><strong>Local:<br></strong> ${coords.lat.toFixed(5)}, ${coords.lng.toFixed(5)}</p>
      </div>
    </div>
  `;

  marker.bindPopup(popupHTML).openPopup();

  // Força delay após DOM completo
  setTimeout(() => {
    const btn = document.getElementById(`btn-${uniqueId}`);
    const select = document.getElementById(`select-${uniqueId}`);
    const form = document.getElementById(`form-${uniqueId}`);
    const resumo = document.getElementById(`resumo-${uniqueId}`);
    const tipoSpan = document.getElementById(`tipo-${uniqueId}`);

    if (btn && select) {
      btn.addEventListener("click", () => {
        const tipo = select.value;
        tipoSpan.textContent = tipo;
        form.style.display = "none";
        resumo.style.display = "block";
        db.collection("marcadores").add({
            tipo: tipo,
            lat: coords.lat,
            lng: coords.lng,
            data: new Date()
          });
      });
    }
  }, 200); // 200ms para garantir DOM renderizado
});
