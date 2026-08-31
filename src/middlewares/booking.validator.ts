import { body } from "express-validator";

export const bookingValidationRules = [
  body("trekId")
    .notEmpty()
    .withMessage("Trek ID is required")
    .isMongoId()
    .withMessage("Invalid trek ID format"),

  body("startDate")
    .notEmpty()
    .withMessage("Start date is required")
    .isISO8601()
    .withMessage("Start date must be a valid date")
    .custom((value) => {
      const date = new Date(value);
      if (date < new Date()) {
        throw new Error("Start date cannot be in the past");
      }
      return true;
    }),

  body("numberOfPeople")
    .isInt({ min: 1 })
    .withMessage("Number of people must be at least 1"),
];