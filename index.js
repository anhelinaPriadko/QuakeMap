import express from "express";
import axios from "axios";
import bodyParser from "body-parser";
import moment from "moment";
import { validationResult, checkSchema } from "express-validator";
import { postValidationSchema } from "./utilities/validationSchema.mjs";

const app = express();
const port = 3000;

app.use(express.json());
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

const earthquakeURL = "https://earthquake.usgs.gov/fdsnws/event/1/query";

app.get("/", (req, res) => {
  res.render("index.ejs");
});

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
  const filteredData = features.filter((feature) => {
    const date = new Date(feature.properties.time);
    const hour = date.getHours();
    if (filter === "day") {
      return hour >= 6 && hour < 18;
    } else {
      return hour >= 18 || hour < 6;
    }
  });
  return filteredData;
}

app.post("/submit", checkSchema(postValidationSchema), async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.json({
        type:"FeatureCollection",
        metadata: {},
        features:[],
        errors: errors.array()
      })
    }
    let start, end;
    if (req.body.startDateTime && req.body.endDateTime) {
      start = req.body.startDateTime;
      end = req.body.endDateTime;
    } else {
      end = new Date();
      start = calcFutureDate(end, req.body.interval);
    }
    start = moment(start).toISOString();
    end = moment(end).toISOString();

    console.log(`Search: from ${start} to ${end}`);
    console.log(`Search magnitude: ${req.body.minMagnitude}`);
    const result = await axios.get(earthquakeURL, {
      params: {
        format: "geojson",
        starttime: start,
        endtime: end,
        minmagnitude: req.body.minMagnitude,
      },
    });
    if (req.body.filter) {
      result.data.features = filterData(result.data.features, req.body.filter);
    }
    // console.log(result.data);
    res.json(result.data);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Server error" });
  }
});

app.listen(port, () => {
  console.log(`Listening port: ${port}`);
});
