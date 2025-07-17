import { connectToDB } from "@/lib/mongodb";
import Payment from "@/models/Payment";
import { NextRequest, NextResponse } from "next/server";

// GET /api/payments/[id]
export async function GET(
  req: NextRequest,
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

// PUT /api/payments/[id]
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  await connectToDB();
  const { id } = params;
  const body = await req.json();

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

// DELETE /api/payments/[id]
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  await connectToDB();
  const { id } = params;

  const deleted = await Payment.findByIdAndDelete(id);
  if (!deleted) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}

export const dynamic = "force-dynamic";
