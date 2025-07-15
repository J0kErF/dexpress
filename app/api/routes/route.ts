import { connectToDB } from "@/lib/mongodb";
import Route from "@/models/Route";
import Shipment from "@/models/Shipment";
import Store from "@/models/Store";
import { NextRequest, NextResponse } from "next/server";

// TypeScript interface
interface ShipmentEntry {
  shipmentId?: string;
  order?: number;
  status?: string;
  notes?: string;
}

interface RoutePayload {
  courierPhone: string;
  date: string; // required
  startTime?: string;
  finishTime?: string;
  routeTotalPrice?: number;
  shipmentOrder?: ShipmentEntry[];
}


// Manual types for lean results
interface StoreLite {
  _id: string;
  businessName: string;
  phoneNumber: string;
  address: string;
}

interface ShipmentLean {
  _id: string;
  customerName: string;
  phoneNumber: string;
  address: string[];
  orderNumber: number;
  shipmentDetails?: string;
  totalPrice?: number;
  isPaid?: boolean;
  otherDetails?: string[]; // [status, storeId, ...]
}

export async function GET() {
  await connectToDB();

  const routes = await Route.find().sort({ date: -1 }).lean();

  for (const route of routes) {
    for (const order of route.shipmentOrder) {
      const shipment = await Shipment.findById(order.shipmentId).lean<ShipmentLean>();

      if (!shipment) continue;

      const storeId = shipment.otherDetails?.[1];
      let store: StoreLite | null = null;

      if (storeId) {
        store = await Store.findById(storeId).lean<StoreLite>();
      }

      // Inject store into shipment
      order.shipmentId = {
        ...shipment,
        store: store
          ? {
              businessName: store.businessName,
              phoneNumber: store.phoneNumber,
              address: store.address.split(" "), // to match array format
            }
          : null,
      } as any;
    }
  }

  return NextResponse.json(routes);
}

export async function POST(req: NextRequest) {
  try {
    await connectToDB();
    const body: RoutePayload = await req.json();

    const { courierPhone, date, startTime, finishTime, routeTotalPrice, shipmentOrder } = body;

    // Enforce only date + courierPhone
    if (!courierPhone || !date) {
      return NextResponse.json({ error: "יש למלא שליח ותאריך" }, { status: 400 });
    }

    const newRoute = await Route.create({
      courierPhone,
      date: new Date(date),
      startTime: startTime ? new Date(startTime) : undefined,
      finishTime: finishTime ? new Date(finishTime) : undefined,
      shipmentOrder: Array.isArray(shipmentOrder) ? shipmentOrder : [],
      routeTotalPrice: typeof routeTotalPrice === "number" ? routeTotalPrice : 0,
    });

    return NextResponse.json(newRoute, { status: 201 });
  } catch (err) {
    console.error("POST /api/routes error:", err);
    return NextResponse.json({ error: "שגיאת שרת" }, { status: 500 });
  }
}