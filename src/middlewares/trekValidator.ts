import { body } from "express-validator";

export const trekValidationRules = [
  body("name").trim().notEmpty().withMessage("Name is required"),

  body("region").trim().notEmpty().withMessage("Region is required"),

  body("difficulty")
    .isIn(["Easy", "Moderate", "Hard", "Strenuous"])
    .withMessage("Difficulty must be Easy, Moderate, Hard, or Strenuous"),

  body("duration").isInt({ min: 1 }).withMessage("Duration must be a positive number"),

  body("priceType")
    .isIn(["fixed", "onRequest"])
    .withMessage("Price type must be 'fixed' or 'onRequest'"),

  body("price")
    .if(body("priceType").equals("fixed"))
    .isFloat({ min: 0 })
    .withMessage("Price is required and must be positive for fixed-price treks"),

  body("advanceAmount")
    .if(body("priceType").equals("fixed"))
    .isFloat({ min: 0 })
    .withMessage("Advance amount is required and must be positive for fixed-price treks"),

  body("maxAltitude").isFloat({ min: 0 }).withMessage("Max altitude must be a positive number"),

  body("maxGroupSize").isInt({ min: 1 }).withMessage("Max group size must be at least 1"),

  body("description").trim().notEmpty().withMessage("Description is required"),

  body("itinerary").isArray().withMessage("Itinerary must be an array"),

  body("itinerary.*.day").isInt({ min: 1 }).withMessage("Each itinerary day must have a valid day number"),

  body("itinerary.*.title").trim().notEmpty().withMessage("Each itinerary day must have a title"),

  body("itinerary.*.description")
    .trim()
    .notEmpty()
    .withMessage("Each itinerary day must have a description"),

  body("inclusions").optional().isArray().withMessage("Inclusions must be an array"),

  body("exclusions").optional().isArray().withMessage("Exclusions must be an array"),
];

export const updateTrekValidationRules = [
  body("name").optional().trim().notEmpty().withMessage("Name cannot be empty"),

  body("region").optional().trim().notEmpty().withMessage("Region cannot be empty"),

  body("difficulty")
    .optional()
    .isIn(["Easy", "Moderate", "Hard", "Strenuous"])
    .withMessage("Difficulty must be Easy, Moderate, Hard, or Strenuous"),

  body("duration").optional().isInt({ min: 1 }).withMessage("Duration must be a positive number"),

  body("priceType")
    .optional()
    .isIn(["fixed", "onRequest"])
    .withMessage("Price type must be 'fixed' or 'onRequest'"),

  body("price").optional().isFloat({ min: 0 }).withMessage("Price must be a positive number"),

  body("advanceAmount")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Advance amount must be a positive number"),

  body("maxAltitude")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Max altitude must be a positive number"),

  body("maxGroupSize")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Max group size must be at least 1"),

  body("description").optional().trim().notEmpty().withMessage("Description cannot be empty"),

  body("itinerary").optional().isArray().withMessage("Itinerary must be an array"),

  body("inclusions").optional().isArray().withMessage("Inclusions must be an array"),

  body("exclusions").optional().isArray().withMessage("Exclusions must be an array"),
];