🌍 Earthquake Visualization Project

This project is a web application that allows users to search, filter, and visualize earthquake data on an interactive map.
The application retrieves earthquake data from the USGS Earthquake API and displays it on a world map with dynamic markers based on magnitude and intensity.

✨ Features

🔎 Search earthquakes by time period (last day, week, 30 days, or 1 year).

⏱ Custom date range filtering (start & end date with time).

📆 Smart validation of input data (no future dates, end date must be later than start date).

🌗 Day/Night filter (filter earthquakes based on the time of day they occurred).

🗺 Interactive Map:

Markers change color based on earthquake magnitude.

Markers change size based on earthquake intensity (CDI).

📋 Error messages shown directly in the interface.

🛠 Technologies Used

Node.js + Express – server-side application

Axios – requests to the USGS API

Moment.js – working with dates & time

Express-Validator – validation & sanitization of input

EJS – templating engine

Leaflet.js – interactive maps and markers

OpenStreetMap tiles – map background

🚀 Installation & Setup

Clone the repository:

git clone https://github.com/your-username/earthquake-visualization.git
cd earthquake-visualization


Install dependencies:

npm install


Start the server:

npm start


Open in browser:

http://localhost:3000
