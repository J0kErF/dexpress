// models/Shipment.ts
import mongoose, { Schema, model, models } from "mongoose";
import Counter from "./Counter";

const ShipmentSchema = new Schema(
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
      type: [String],
      default: [null, null, null, null],
    },
    shipmentDetails: String,
    totalPrice: Number,
    isPaid: {
      type: Boolean,
      default: false,
    },
    otherDetails: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

// Pre-save hook
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

export default models.Shipment || model("Shipment", ShipmentSchema);
