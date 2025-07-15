import { NextRequest, NextResponse } from "next/server";
import { connectToDB } from "@/lib/mongodb";
import Shipment from "@/models/Shipment";
import mongoose from "mongoose";

/* -------------------------------- GET -------------------------------- */
export async function GET(_req: NextRequest, ctx: { params: { id: string } }) {
  await connectToDB();
  const { id } = ctx.params;

  if (!mongoose.Types.ObjectId.isValid(id))
    return NextResponse.json({ error: "Invalid ID" }, { status: 400 });

  const shipment = await Shipment.findById(id);
  if (!shipment)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json(shipment);
}

/* -------------------------------- PUT (Update All Fields) -------------------------------- */
export async function PUT(req: NextRequest, ctx: { params: { id: string } }) {
  const { id } = ctx.params;

  if (!mongoose.Types.ObjectId.isValid(id))
    return NextResponse.json({ error: "Invalid ID" }, { status: 400 });

  let body: any = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  await connectToDB();

  try {
    const shipment = await Shipment.findById(id);
    if (!shipment)
      return NextResponse.json({ error: "Shipment not found" }, { status: 404 });

    // עדכון כל השדות
    if (typeof body.customerName === "string") shipment.customerName = body.customerName;
    if (typeof body.phoneNumber === "string") shipment.phoneNumber = body.phoneNumber;
    if (Array.isArray(body.address)) shipment.address = body.address;
    if (typeof body.shipmentDetails === "string") shipment.shipmentDetails = body.shipmentDetails;
    if (typeof body.totalPrice === "number") shipment.totalPrice = body.totalPrice;
    if (typeof body.isPaid === "boolean") shipment.isPaid = body.isPaid;

    // נוודא ש־otherDetails תמיד באורך 3 לפחות
    if (Array.isArray(body.otherDetails)) {
      while (body.otherDetails.length < 3) body.otherDetails.push("");
      shipment.otherDetails = body.otherDetails;
    }

    await shipment.save();

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("PUT /shipments error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

/* -------------------------------- DELETE -------------------------------- */
export async function DELETE(_req: NextRequest, ctx: { params: { id: string } }) {
  const { id } = ctx.params;

  if (!mongoose.Types.ObjectId.isValid(id))
    return NextResponse.json({ error: "Invalid ID" }, { status: 400 });

  await connectToDB();
  const deleted = await Shipment.findByIdAndDelete(id);

  return deleted
    ? NextResponse.json({ success: true })
    : NextResponse.json({ error: "Not found" }, { status: 404 });
}

/* -------------------------------- PATCH (Partial Update) -------------------------------- */
export async function PATCH(req: NextRequest, ctx: { params: { id: string } }) {
  const { id } = ctx.params;

  if (!mongoose.Types.ObjectId.isValid(id))
    return NextResponse.json({ error: "Invalid ID" }, { status: 400 });

  let body: any = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  await connectToDB();
  try {
    const updated = await Shipment.findByIdAndUpdate(id, { $set: body }, { new: true });
    return updated
      ? NextResponse.json(updated)
      : NextResponse.json({ error: "Not found" }, { status: 404 });
  } catch (err: any) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

/* make sure NOT edge */
export const dynamic = "force-dynamic";
