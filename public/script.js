let map = L.map("map").setView([51.505, -0.09], 2);
L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
  attribution:
    '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
}).addTo(map);

let geojsonMarkerOptions = {
  radius: 6,
  fillColor: "#9a9a9cff",
  color: "#000",
  weight: 0.5,
  opacity: 1,
  fillOpacity: 0.8,
};

function changeMarkerColor(markerOption, magnitude) {
  if (magnitude === null) markerOption.fillColor = "#b2b2b2ff";
  else if (magnitude < 2) markerOption.fillColor = "#00ff00";
  else if (magnitude < 3) markerOption.fillColor = "#bbff00ff";
  else if (magnitude < 4) markerOption.fillColor = "#ffff00";
  else if (magnitude < 5) markerOption.fillColor = "#ffbf00";
  else if (magnitude < 6) markerOption.fillColor = "#ff8000";
  else if (magnitude < 7) markerOption.fillColor = "#ff4000";
  else if (magnitude < 8) markerOption.fillColor = "#ff0000";
  else if (magnitude < 9) markerOption.fillColor = "#ff0000";
  else if (magnitude < 12) markerOption.fillColor = "#8b0000";
  else markerOption.fillColor = "#b2b2b2ff";
}

function changeMarkerRadius(markerOption, intensity) {
  if (intensity == null) {
    markerOption.radius = 5;
  } else if (intensity <= 3) {
    markerOption.radius = 6;
  } else if (intensity <= 5) {
    markerOption.radius = 9;
  } else if (intensity <= 7) {
    markerOption.radius = 12;
  } else if (intensity <= 9) {
    markerOption.radius = 15;
  } else {
    markerOption.radius = 18;
  }
}

const pTag = document.getElementById("text-content");
const form = document.querySelector("form");

//to dosplay popups
function onEachFeature(feature, layer) {
  if (feature.properties && !feature.properties.popupContent) {
    feature.properties.popupContent = `Place: ${feature.properties.place}<br>
          Magnitude: ${feature.properties.mag} (mb)<br>
          Depth: ${feature.geometry.coordinates[2]} km<br>
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

  // Видаляємо старий шар (якщо є)
  if (window.pointsLayer) {
    map.removeLayer(window.pointsLayer);
  }

  // Створюємо новий шар з отриманих даних
  window.pointsLayer = L.geoJSON(geoJSONResult, {
    pointToLayer: function (feature, latlng) {
      let markerOptions = { ...geojsonMarkerOptions };
      changeMarkerColor(markerOptions, feature.properties.mag);
      changeMarkerRadius(markerOptions, feature.properties.cdi);
      return L.circleMarker(latlng, markerOptions);
    },
    onEachFeature: onEachFeature,
  }).addTo(map);
});
