import moment from "moment";

function formatDate(date, time) {
  return moment(`${date}T${time}`, "YYYY-MM-DDTHH:mm");
}
function checkFutureDate(date) {
  return moment(date).isAfter(new Date());
}

export const postValidationSchema = {
  chosenInput: {
    in: ["body"],
    custom: {
      options: (value, { req }) => {
        if (!req.body.startDate && !req.body.endDate && !req.body.interval) {
          throw new Error(
            "You must enter data: start and end date or choose one interval option!"
          );
        }
        return true;
      },
    },
  },

  startDate: {
    in: ["body"],
    optional: true,
  },

  startTime: {
    in: ["body"],
    optional: true,
  },

  endDate: {
    in: ["body"],
    optional: true,
  },

  endTime: {
    in: ["body"],
    optional: true,
  },
  startDateTime: {
    in: ["body"],
    customSanitizer: {
      options: (value, { req }) => {
        if (req.body.startDate && req.body.startTime)
          return formatDate(req.body.startDate, req.body.startTime);
        return req.body.startDate;
      },
    },
    custom: {
      options: (value, { req }) => {
        if (checkFutureDate(value))
          throw new Error("You can`t enter future start date!");
        if (req.body.startDate && !req.body.endDate) req.endDate = new Date();
        return true;
      },
    },
  },
  endDateTime: {
    in: ["body"],
    customSanitizer: {
      options: (value, { req }) => {
        if (req.body.endDate && req.body.endTime)
          return formatDate(req.body.endDate, req.body.endTime);
        return req.body.endDate;
      },
    },
    custom: {
      options: (value, {req}) => {
        if (checkFutureDate(value))
          throw new Error("You can`t enter future end date!");
        if (req.body.startDateTime > value)
          throw new Error("End date must be later than start date!");
        return true;
      },
    },
  },
};
