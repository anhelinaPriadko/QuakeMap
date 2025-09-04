import express from "express";
import axios from "axios";
import bodyParser from "body-parser";
import moment from "moment";
import { validationResult, checkSchema } from "express-validator";
// import { postValidationSchema } from "./utilities/validationSchemas.mjs";

const app = express();
const port = 3000;

app.use(express.json());
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

const earthquakeURL = "https://earthquake.usgs.gov/fdsnws/event/1/query";

app.get("/", (req, res) => {
  res.render("index.ejs");
});

function formatDate(date, time) {
  return moment(`${date}T${time}`, "YYYY-MM-DDTHH:mm");
}

function calcFutureDate(endDate, interval) {
  switch (interval) {
    case "1 year":
      return moment(endDate).subtract(1, "year");
    case "30 days":
      return moment(endDate).subtract(30, "days");
    case "7 days":
      return moment(endDate).subtract(7, "days");
    default:
      return moment(endDate).subtract(1, "day");
  }
}

function filterData(features, filter) {
  let start, end;
  switch (filter) {
    case "day":
      start = 6;
      end = 18;
      break;
    case "night":
      start = 18;
      end = 6;
      break;
    default:
      return features;
  }

  const filteredData = features.filter(
    (feature) => feature.time > start || feature.time < end
  );
  return filteredData;
}

app.post("/submit", async (req, res) => {
  try {
    let startTime;
    let endTime;
    if (req.body.startDate && req.body.endDate) {
      if (req.body.startTime)
        startTime = formatDate(req.body.startDate, req.body.startTime);
      else startTime = req.body.startDate;

      if (req.body.endTime)
        endTime = formatDate(req.body.endDate, req.body.endTime);
      else endTime = req.body.endDate;
    } else {
      endTime = new Date();
      startTime = calcFutureDate(endTime, req.body.interval);
    }
    startTime = moment(startTime).toISOString();
    endTime = moment(endTime).toISOString();

    console.log(`Search: from ${startTime} to ${endTime}`);
    console.log(`Search magnitude: ${req.body.minMagnitude}`);
    const result = await axios.get(earthquakeURL, {
      params: {
        format: "geojson",
        starttime: startTime,
        endtime: endTime,
        minmagnitude: req.body.minMagnitude,
      },
    });
    if (req.body.filter) {
      result.data = filterData(result.features, req.body.filter);
    }
    res.json(result.data);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Server error" });
  }
});

app.listen(port, () => {
  console.log(`Listening port: ${port}`);
});
