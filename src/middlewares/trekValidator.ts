import { body } from "express-validator";

export const trekValidationRules = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Name is required"),

  body("region")
    .trim()
    .notEmpty()
    .withMessage("Region is required"),

  body("difficulty")
    .isIn(["Easy", "Moderate", "Hard", "Strenuous"])
    .withMessage("Difficulty must be Easy, Moderate, Hard, or Strenuous"),

  body("duration")
    .isInt({ min: 1 })
    .withMessage("Duration must be a positive number"),

  body("price")
    .isFloat({ min: 0 })
    .withMessage("Price must be a positive number"),

  body("advanceAmount")
    .isFloat({ min: 0 })
    .withMessage("Advance amount must be a positive number"),

  body("maxAltitude")
    .isFloat({ min: 0 })
    .withMessage("Max altitude must be a positive number"),

  body("description")
    .trim()
    .notEmpty()
    .withMessage("Description is required"),
];

export const updateTrekValidationRules = [
  body("name").optional().trim().notEmpty().withMessage("Name cannot be empty"),

  body("region").optional().trim().notEmpty().withMessage("Region cannot be empty"),

  body("difficulty")
    .optional()
    .isIn(["Easy", "Moderate", "Hard", "Strenuous"])
    .withMessage("Difficulty must be Easy, Moderate, Hard, or Strenuous"),

  body("duration").optional().isInt({ min: 1 }).withMessage("Duration must be a positive number"),

  body("price").optional().isFloat({ min: 0 }).withMessage("Price must be a positive number"),

  body("advanceAmount")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Advance amount must be a positive number"),

  body("maxAltitude")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Max altitude must be a positive number"),

  body("description").optional().trim().notEmpty().withMessage("Description cannot be empty"),
];