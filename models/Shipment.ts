import mongoose from "mongoose";
import Counter from "./Counter";

const ShipmentSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: Number,
      unique: true,
    },
    customerName: {
      type: String,
      required: true,
    },
    phoneNumber: {
      type: String,
      required: true,
    },
    address: {
      type: [String], // [city, location text, lng, lat]
      default: [null, null, null, null],
    },
    shipmentDetails: {
      type: String,
    },
    totalPrice: {
      type: Number,
    },
    isPaid: {
      type: Boolean,
      default: false,
    },
    otherDetails: { // [0: status, 1: storeId, 2: deliveryTime]
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

// Pre-save hook to auto-increment orderNumber
ShipmentSchema.pre("save", async function (next) {
  if (this.isNew) {
    const counter = await Counter.findOneAndUpdate(
      { name: "shipment" },
      { $inc: { value: 1 } },
      { new: true, upsert: true }
    );
    this.orderNumber = counter.value;
  }
  next();
});

export default mongoose.models.Shipment ||
  mongoose.model("Shipment", ShipmentSchema);
