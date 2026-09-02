import { body } from "express-validator";

export const enquiryValidationRules = [
  body("trekId")
    .notEmpty()
    .withMessage("Trek ID is required")
    .isMongoId()
    .withMessage("Invalid trek ID format"),

  body("name").trim().notEmpty().withMessage("Name is required"),

  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Please provide a valid email"),

  body("phone").trim().notEmpty().withMessage("Phone number is required"),

  body("message").trim().notEmpty().withMessage("Message is required"),

  body("numberOfPeople")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Number of people must be a positive number"),

  body("tentativeDate")
    .optional()
    .isISO8601()
    .withMessage("Tentative date must be a valid date"),
];
