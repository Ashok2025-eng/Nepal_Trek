import mongoose, { Document, Schema, Types } from "mongoose";

export interface IEnquiry extends Document {
  user?: Types.ObjectId;
  trek: Types.ObjectId;
  name: string;
  email: string;
  phone: string;
  message: string;
  numberOfPeople?: number;
  tentativeDate?: Date;
  status: "new" | "contacted" | "closed";
  createdAt: Date;
  updatedAt: Date;
}

const enquirySchema = new Schema<IEnquiry>(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    trek: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Trek",
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    numberOfPeople: {
      type: Number,
    },
    tentativeDate: {
      type: Date,
    },
    status: {
      type: String,
      enum: ["new", "contacted", "closed"],
      default: "new",
    },
  },
  { timestamps: true },
);

const Enquiry = mongoose.model<IEnquiry>("Enquiry", enquirySchema);
export default Enquiry;
