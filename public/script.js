let map = L.map("map").setView([51.505, -0.09], 2);
L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
  attribution:
    '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
}).addTo(map);

let markers = L.markerClusterGroup({
    chunkedLoading: true,
    chunkInterval: 50,
});
map.addLayer(markers);

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
const errors = document.getElementById("errors");
const errorsList = document.getElementById("errors-list");
const spinnerElement = document.getElementById("loading-spinner");

function showSpinner() {
  spinnerElement.classList.remove("hidden");
}

function hideSpinner() {
  spinnerElement.classList.add("hidden");
}

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
  showSpinner();

  if (errors.classList.contains("show-errors"))
    errors.classList.remove("show-errors");

  if (!errors.classList.contains("hide-errors"))
    errors.classList.add("hide-errors");

  const formData = new FormData(form);
  const data = Object.fromEntries(formData.entries());

  const res = await fetch("/submit", {
    method: "POST",
    headers: {
      "Content-type": "application/json",
    },
    body: JSON.stringify(data),
  });

  hideSpinner();
  let geoJSONResult = await res.json();

  if (geoJSONResult.errors) {
    errorsList.innerHTML = "";

    if (errors.classList.contains("hide-errors"))
      errors.classList.remove("hide-errors");
    if (!errors.classList.contains("show-errors"))
      errors.classList.add("show-errors");
    for (const error of geoJSONResult.errors) {
      const li = document.createElement("li");
      li.textContent = error.msg;
      errorsList.appendChild(li);
    }
  }

  markers.clearLayers();

  let newGeoJsonLayer = L.geoJSON(geoJSONResult, {
    pointToLayer: function (feature, latlng) {
      let markerOptions = { ...geojsonMarkerOptions };
      changeMarkerColor(markerOptions, feature.properties.mag);
      changeMarkerRadius(markerOptions, feature.properties.cdi);
      return L.circleMarker(latlng, markerOptions);
    },
    onEachFeature: onEachFeature,
  });

  markers.addLayer(newGeoJsonLayer);
  if (geoJSONResult.features && geoJSONResult.features.length > 0) {
    map.fitBounds(markers.getBounds());
  }
});

const radios = document.querySelectorAll('input[type="radio"]');
radios.forEach((radio) => {
  radio.addEventListener("click", (e) => {
    if (radio.wasChecked) {
      radio.checked = false;
    }
    radios.forEach((r) => (r.wasChecked = r.checked));
  });
});

const inputDates = document.querySelectorAll(".inputDate");
const radioTemps = document.querySelectorAll("#radio-temp-input");

radioTemps.forEach((radio) => {
  radio.addEventListener("click", () => {
    inputDates.forEach((element) => {
      element.value = "";
    });
  });
});

inputDates.forEach((date) => {
  date.addEventListener("input", (d) => {
    radios.forEach((r) => {
      r.checked = false;
      r.wasChecked = false;
    });
  });
});
