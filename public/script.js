let map = L.map("map").setView([51.505, -0.09], 2);
let geojsonMarkerOptions = {
  radius: 8,
  fillColor: "#1e00ffff",
  color: "#000",
  weight: 1,
  opacity: 1,
  fillOpacity: 0.8,
};

function changeMarkerOptions(markerOption, magnitude) {
  if (magnitude >= 0 && magnitude < 2) markerOption.fillColor = "#00ff00";
  else if (magnitude >= 2 && magnitude < 3)
    markerOption.fillColor = "#bbff00ff";
  else if (magnitude >= 3 && magnitude < 4) markerOption.fillColor = "#ffff00";
  else if (magnitude >= 4 && magnitude < 5) markerOption.fillColor = "#ffbf00";
  else if (magnitude >= 5 && magnitude < 6) markerOption.fillColor = "#ff8000";
  else if (magnitude >= 6 && magnitude < 7) markerOption.fillColor = "#ff4000";
  else if (magnitude >= 7 && magnitude < 8) markerOption.fillColor = "#ff0000";
  else if (magnitude >= 8 && magnitude < 9) markerOption.fillColor = "#ff0000";
  else if (magnitude >= 9 && magnitude < 10) markerOption.fillColor = "#8b0000";
  else markerOption.fillColor = "#b2b2b2ff";
}

L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
  attribution:
    '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
}).addTo(map);

const pTag = document.getElementById("text-content");
const form = document.querySelector("form");

//to dosplay popups
function onEachFeature(feature, layer) {
  if (feature.properties && !feature.properties.popupContent) {
    feature.properties.popupContent = `Place: ${feature.properties.place}<br>
          Magnitude: ${feature.properties.mag} (mb)<br>
          Depth: ${feature.geometry.coordinates[3]} km<br>
          Intensity (CDI): ${feature.properties.cdi}<br>  
          Felt reports: ${feature.properties.felt}<br>  
          Date: ${new Date(feature.properties.time).toLocaleString()}`;
    layer.bindPopup(feature.properties.popupContent);
  }
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const formData = new FormData(form);
  const data = Object.fromEntries(formData.entries());

  const res = await fetch("/submit", {
    method: "POST",
    headers: {
      "Content-type": "application/json",
    },
    body: JSON.stringify(data),
  });

  let geoJSONResult = await res.json();
  pTag.textContent = JSON.stringify(geoJSONResult);

  // Видаляємо старий шар (якщо є)
  if (window.pointsLayer) {
    map.removeLayer(window.pointsLayer);
  }

  // Створюємо новий шар з отриманих даних
  window.pointsLayer = L.geoJSON(geoJSONResult, {
    pointToLayer: function (feature, latlng) {
      let markerOptions = { ...geojsonMarkerOptions };
      changeMarkerOptions(markerOptions, feature.properties.mag);
      return L.circleMarker(latlng, markerOptions);
    },
    onEachFeature: onEachFeature,
  }).addTo(map);
});
