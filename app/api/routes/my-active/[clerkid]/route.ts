/* app/api/routes/my-active/[clerkid]/route.ts */
import { NextRequest, NextResponse } from "next/server";
import { connectToDB } from "@/lib/mongodb";
import Route from "@/models/Route";
import Shipment from "@/models/Shipment";
import Store from "@/models/Store";

/* ---------- lean helper types ---------- */
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
  totalPrice?: number;
  otherDetails?: string[]; // [status, storeId, ...]
}

/* ---------- helper to add populated shipment + store ---------- */
async function populateShipment(order: any) {
  const ship = await Shipment.findById(order.shipmentId).lean<ShipmentLean>();
  if (!ship) return;

  let store: StoreLite | null = null;
  const storeId = ship.otherDetails?.[1];
  if (storeId) store = await Store.findById(storeId).lean<StoreLite>();

  order.shipmentId = {
    ...ship,
    store: store
      ? {
          businessName: store.businessName,
          phoneNumber: store.phoneNumber,
          address: store.address?.split(" ") || [],
        }
      : null,
  } as any;
}

/* ---------- GET handler ---------- */
export async function GET(
  req: NextRequest,
  context: { params: { clerkid: string } }
) {
  try {
    const { clerkid } = await context.params;
    if (!clerkid)
      return NextResponse.json({ error: "Missing clerkid" }, { status: 400 });

    await connectToDB();

    const now = new Date();
    const todayStart = new Date(now.setHours(0, 0, 0, 0));
    const todayEnd = new Date(now.setHours(23, 59, 59, 999));

    const url = new URL(req.url);
    const historyOnly = url.searchParams.get("history") === "1";

    /* populate helper */
    const populateRoute = async (route: any | null) => {
      if (!route) return null;
      for (const order of route.shipmentOrder) {
        await populateShipment(order);
      }
      return route;
    };

    /* Fetch routes */
    const historyRaw = await Route.find({
      courierPhone: clerkid,
    }).sort({ date: -1 }).lean();

    const history = await Promise.all(historyRaw.map(populateRoute));

    if (historyOnly) {
      return NextResponse.json({ history });
    }

    const activeRaw = await Route.findOne({
      courierPhone: clerkid,
      date: { $gte: todayStart, $lte: todayEnd },
      finishTime: { $exists: false },
    }).sort({ date: -1 }).lean();

    const active = await populateRoute(activeRaw);

    return NextResponse.json({ active, history });
  } catch (err) {
    console.error("GET /api/routes/my-active/[clerkid] error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
