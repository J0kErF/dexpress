import mongoose from "mongoose";

// סטטוסים אפשריים למשלוחים
const shipmentStatusEnum = [
  "בהמתנה",       // waiting
  "בסניף",         // in store
  "נאסף",         // picked up
  "בדרך ללקוח",   // on the way
  "במשלוח",       // on delivery
  "נמסר",         // delivered
  "החזרות",       // return
  "בוטל",         // canceled
];

const ShipmentStatusSchema = new mongoose.Schema(
  {
    shipmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Shipment",
      required: true,
    },
    order: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: shipmentStatusEnum,
      default: "בהמתנה",
    },
    notes: {
      type: String,
      default: "",
    },
  },
  { _id: false }
);

const RouteSchema = new mongoose.Schema(
  {
    courierPhone: {
      type: String,
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    startTime: {
      type: Date, // זמן תחילת המסלול בפועל
    },
    finishTime: {
      type: Date, // זמן סיום המסלול בפועל
    },
    routeTotalPrice: {
      type: Number,
      default: 0,
    },
    shipmentOrder: {
      type: [ShipmentStatusSchema],
      default: [],
    },
  },
  { timestamps: true }
);

export default mongoose.models.Route || mongoose.model("Route", RouteSchema);
