import mongoose, { Document, Schema } from "mongoose";

interface IItineraryDay {
  day: number;
  title: string;
  description: string;
}

export interface ITrek extends Document {
  name: string;
  region: string;
  difficulty: "Easy" | "Moderate" | "Hard" | "Strenuous";
  duration: number;
  priceType: "fixed" | "onRequest";
  price?: number;
  advanceAmount?: number;
  maxAltitude: number;
  maxGroupSize: number;
  description: string;
  itinerary: IItineraryDay[];
  inclusions: string[];
  exclusions: string[];
  images: string[];
  averageRating: number;
  numReviews: number;
  createdAt: Date;
  updatedAt: Date;
}

const itinerarySchema = new Schema<IItineraryDay>(
  {
    day: {
      type: Number,
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { _id: false },
);

const trekSchema = new Schema<ITrek>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    region: {
      type: String,
      required: true,
    },
    difficulty: {
      type: String,
      enum: ["Easy", "Moderate", "Hard", "Strenuous"],
      required: true,
    },
    duration: {
      type: Number,
      required: true,
    },
    priceType: {
      type: String,
      enum: ["fixed", "onRequest"],
      required: true,
      default: "fixed",
    },
    price: {
      type: Number,
      required: function (this: ITrek) {
        return this.priceType === "fixed";
      },
    },
    advanceAmount: {
      type: Number,
      required: function (this: ITrek) {
        return this.priceType === "fixed";
      },
    },
    maxAltitude: {
      type: Number,
      required: true,
    },
    maxGroupSize: {
      type: Number,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    itinerary: {
      type: [itinerarySchema],
      default: [],
    },
    inclusions: {
      type: [String],
      default: [],
    },
    exclusions: {
      type: [String],
      default: [],
    },
    images: [String],
    averageRating: {
      type: Number,
      default: 0,
    },
    numReviews: {
      type: Number,
      default: 0,
    },
  },

  { timestamps: true },
);

const Trek = mongoose.model<ITrek>("Trek", trekSchema);

export default Trek;
