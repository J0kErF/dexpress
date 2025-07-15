import { connectToDB } from "@/lib/mongodb";
import Shipment from "@/models/Shipment";
import { NextResponse } from "next/server";

// GET unpaid shipments for a specific store ID (in otherDetails[1])
export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDB();
    const { id: storeId } = params;

    const unpaidShipments = await Shipment.find({
      isPaid: false,
      "otherDetails.1": storeId,
    }).sort({ createdAt: -1 });

    return NextResponse.json(unpaidShipments);
  } catch (err: any) {
    console.error("❌ Unpaid shipment fetch error:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
