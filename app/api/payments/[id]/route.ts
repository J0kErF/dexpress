import { connectToDB } from "@/lib/mongodb";
import Payment from "@/models/Payment";
import { NextResponse } from "next/server";

// GET payment by ID
export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  await connectToDB();
  const { id } = params;

  const payment = await Payment.findById(id);
  if (!payment) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(payment);
}

// PUT: Replace the whole payment document
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  const body = await req.json();
  await connectToDB();

  try {
    const updated = await Payment.findByIdAndUpdate(id, body, { new: true });
    if (!updated) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json(updated);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// DELETE payment by ID
export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  await connectToDB();

  const deleted = await Payment.findByIdAndDelete(id);
  if (!deleted) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ success: true });
}

export const dynamic = "force-dynamic";
