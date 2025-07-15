import mongoose from "mongoose";

const WorkingHourSchema = new mongoose.Schema(
  {
    day: {
      type: String,
      enum: [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ],
    },
    closed: {
      type: Boolean,
      default: false,
    },
    open: {
      type: String,
      default: "",
    },
    close: {
      type: String,
      default: "",
    },
  },
  { _id: false }
);

const StoreSchema = new mongoose.Schema(
  {
    businessName: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    phoneNumber: {
      type: String,
      required: true,
    },
    workingHours: {
      type: [WorkingHourSchema],
      default: [],
    },
  },
  { timestamps: true }
);

export default mongoose.models.Store || mongoose.model("Store", StoreSchema);
