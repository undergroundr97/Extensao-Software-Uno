const map = L.map('map').setView([0, 0], 13);
import { collection, addDoc, getDocs } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap contributors',
  maxZoom: 19
}).addTo(map);

// Carregar eventos do Firestore
async function carregarEventosDoFirestore() {
  try {
    const querySnapshot = await getDocs(collection(db, "eventosCulturais"));
    querySnapshot.forEach((doc) => {
      const dados = doc.data();

      const marker = L.marker([dados.coordenadas.lat, dados.coordenadas.lng]).addTo(map);
      marker.bindPopup(`
        <strong>Evento:</strong> ${dados.tipo}<br>
        <strong>Descrição:</strong> ${dados.descricao || "Sem descrição"}<br>
        <strong>Data:</strong> ${dados.data || "N/A"}<br>
        <strong>Hora:</strong> ${dados.hora || "N/A"}<br>
        <strong>Local:</strong> ${dados.coordenadas.lat.toFixed(5)}, ${dados.coordenadas.lng.toFixed(5)}
      `);
    });
  } catch (e) {
    console.error("Erro ao carregar eventos do Firestore:", e);
  }
}
carregarEventosDoFirestore();

// Centralizar no usuário
if (navigator.geolocation) {
  navigator.geolocation.getCurrentPosition(function(position) {
    const lat = position.coords.latitude;
    const lng = position.coords.longitude;
    map.setView([lat, lng], 15);
    L.marker([lat, lng]).addTo(map).bindPopup("Você está aqui").openPopup();
  });
}

// Clique para adicionar novo evento
map.on("click", function (e) {
  const coords = e.latlng;
  const uniqueId = Date.now();

  const marker = L.marker(coords).addTo(map);

  const popupHTML = `
  <div id="popup-${uniqueId}" class="popup-container">
    <div id="form-${uniqueId}">
      <label>Tipo de evento:</label>
      <select id="select-${uniqueId}">
        <option value="Apresentacao">Apresentação de Rua</option>
        <option value="Exposicao">Exposição de Arte</option>
        <option value="Feira">Feira Cultural</option>
        <option value="Roda">Roda Cultural</option>
        <option value="Outro">Outro</option>
      </select>

      <label>Descrição:</label>
      <textarea id="desc-${uniqueId}" rows="3" cols="25"></textarea>

      <label>Data:</label>
      <input type="date" id="data-${uniqueId}">

      <label>Hora:</label>
      <input type="time" id="hora-${uniqueId}">

      <button id="btn-${uniqueId}">Salvar Evento</button>
    </div>

    <div id="resumo-${uniqueId}" class="popup-summary" style="display:none;">
      <p><strong>Evento:</strong> <span id="tipo-${uniqueId}"></span></p>
      <p><strong>Descrição:</strong> <span id="texto-${uniqueId}"></span></p>
      <p><strong>Data:</strong> <span id="dataShow-${uniqueId}"></span></p>
      <p><strong>Hora:</strong> <span id="horaShow-${uniqueId}"></span></p>
      <p><strong>Local:</strong><br> ${coords.lat.toFixed(5)}, ${coords.lng.toFixed(5)}</p>
    </div>
  </div>
`;

  marker.bindPopup(popupHTML).openPopup();

  setTimeout(() => {
    const btn = document.getElementById(`btn-${uniqueId}`);
    const select = document.getElementById(`select-${uniqueId}`);
    const desc = document.getElementById(`desc-${uniqueId}`);
    const data = document.getElementById(`data-${uniqueId}`);
    const hora = document.getElementById(`hora-${uniqueId}`);

    const form = document.getElementById(`form-${uniqueId}`);
    const resumo = document.getElementById(`resumo-${uniqueId}`);
    const tipoSpan = document.getElementById(`tipo-${uniqueId}`);
    const textoSpan = document.getElementById(`texto-${uniqueId}`);
    const dataSpan = document.getElementById(`dataShow-${uniqueId}`);
    const horaSpan = document.getElementById(`horaShow-${uniqueId}`);

    if (btn && select && desc && data && hora) {
      btn.addEventListener("click", async () => {
        const tipo = select.value;
        const descricao = desc.value;
        const dataValor = data.value;
        const horaValor = hora.value;

        tipoSpan.textContent = tipo;
        textoSpan.textContent = descricao;
        dataSpan.textContent = dataValor;
        horaSpan.textContent = horaValor;

        form.style.display = "none";
        resumo.style.display = "block";

        try {
          await addDoc(collection(db, "eventosCulturais"), {
            tipo: tipo,
            descricao: descricao,
            data: dataValor,
            hora: horaValor,
            coordenadas: {
              lat: coords.lat,
              lng: coords.lng
            },
            timestamp: new Date()
          });
          console.log("Evento salvo com sucesso!");
        } catch (e) {
          console.error("Erro ao salvar o evento no Firestore: ", e);
        }
      });
    }
  }, 200);
});
