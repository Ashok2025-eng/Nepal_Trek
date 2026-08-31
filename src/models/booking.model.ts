import mongoose, { Document, Schema, Types } from "mongoose";

export interface IBooking extends Document {
  user: Types.ObjectId;
  trek: Types.ObjectId;
  startDate: Date;
  numberOfPeople: number;
  totalPrice: number;
  advanceAmount: number;
  status: "pending" | "confirmed" | "cancelled" | "completed";
  createdAt: Date;
  updatedAt: Date;
}

const bookingSchema = new Schema<IBooking>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    trek: {
      type: Schema.Types.ObjectId,
      ref: "Trek",
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    numberOfPeople: {
      type: Number,
      required: true,
      min: 1,
    },
    totalPrice: {
      type: Number,
      required: true,
    },
    advanceAmount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled", "completed"],
      default: "pending",
    },
  },

  { timestamps: true },
);

const Booking = mongoose.model<IBooking>("Booking", bookingSchema);

export default Booking;
