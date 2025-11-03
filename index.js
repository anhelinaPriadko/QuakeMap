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
        type: "FeatureCollection",
        metadata: {},
        features: [],
        errors: errors.array(),
      });
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

    const params = {
      format: "geojson",

      starttime: start,

      endtime: end,
    };

    if (req.body.minMagnitude && req.body.minMagnitude !== "") {
      params.minmagnitude = req.body.minMagnitude;
    } else {
      params.minmagnitude = 2.5;
    }

    console.log(`Search: from ${start} to ${end}`);
    console.log(`Search magnitude: ${params.minmagnitude}`);

    const result = await axios.get(earthquakeURL, {
      params: params,
    });
    if (req.body.filter) {
      result.data.features = filterData(result.data.features, req.body.filter);
    }
    console.log(result.data);
    res.json(result.data);
  } catch (error) {
    let errorMessage = "Occured server error, try again later!";
    let isApiLimitError = false;

    if (
      error.response &&
      error.response.status === 400 &&
      error.response.data &&
      error.response.data.includes("exceeds search limit")
    ) {
      errorMessage =
        "You`ve reached data limit, please specify higher magnitude or shorten time interval!";

      isApiLimitError = true;

      console.error("API Limit Error:", error.response.data);
    } else {
      console.error("Unexpected error during API call:", error);
    }

    return res.json({
      type: "FeatureCollection",
      metadata: {},
      features: [],
      errors: [
        {
          type: isApiLimitError ? "api-limit" : "server-error",
          msg: errorMessage,
          path: "external-api",
          location: "server",
        },
      ],
    });
  }
});

app.listen(port, () => {
  console.log(`Listening port: ${port}`);
});
