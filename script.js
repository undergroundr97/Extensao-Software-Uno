const map = L.map('map').setView([0,0], 13); //SP
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position){
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            map.setView([lat,lng], 16);
            L.marker([lat,lng]).addTo(map)
            .bindPopup("Voce esta aqui.")
            .openPopup();
        }, function(){
            alert("Nao foi possivel obter sua localizaçao.");
        });
    }
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors'
         }).addTo(map);
    map.on('click', function(e){
        const lat = e.latlng.lat;
        const lng = e.latlng.lng;
        L.marker([lat,lng]).addTo(map)
        .bindPopup('Problema reportao aqui: ' + lat.toFixed(5) + lng.toFixed(5))
        .openPopup()
    })
