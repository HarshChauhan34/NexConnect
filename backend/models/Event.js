import mongoose from "mongoose";

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Event title is required"],
      trim: true,
    },
    category: {
      type: String,
      required: [true, "Event category is required"],
      trim: true,
    },
    city: {
      type: String,
      required: [true, "City is required"],
      trim: true,
    },
    date: {
      type: Date,
      required: [true, "Event date is required"],
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true },
);

eventSchema.index({ title: "text", city: "text", category: "text" });
eventSchema.index({ date: 1 });

const Event = mongoose.model("Event", eventSchema);

export default Event;
