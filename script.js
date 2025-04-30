const map = L.map('map').setView([0, 0], 13);
import { getFirestore, collection, addDoc, getDocs } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap contributors',
  maxZoom: 19
}).addTo(map);
async function carregarProblemasDoFirestore() {
    try {
      const querySnapshot = await getDocs(collection(db, "problemas"));
      querySnapshot.forEach((doc) => {
        const dados = doc.data();
  
        const marker = L.marker([dados.coordenadas.lat, dados.coordenadas.lng]).addTo(map);
        marker.bindPopup(`
          <strong>Problema:</strong> ${dados.tipo}<br>
          <strong>Local:</strong> ${dados.coordenadas.lat.toFixed(5)}, ${dados.coordenadas.lng.toFixed(5)}
        `);
      });
    } catch (e) {
      console.error("Erro ao carregar problemas do Firestore:", e);
    }
  }
  carregarProblemasDoFirestore();

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
        btn.addEventListener("click", async () => {
          const tipo = select.value;
          tipoSpan.textContent = tipo;
          form.style.display = "none";
          resumo.style.display = "block";
  
          // Salvar o problema no Firestore
          try {
            // Agora que o addDoc está importado corretamente, o código funciona
            await addDoc(collection(db, "problemas"), {
              tipo: tipo,
              coordenadas: {
                lat: coords.lat,
                lng: coords.lng
              },
              timestamp: new Date()
            });
            console.log("Problema salvo com sucesso!");
          } catch (e) {
            console.error("Erro ao salvar o problema no Firestore: ", e);
          }
        });
      }
    }, 200); // 200ms para garantir DOM renderizado
  });