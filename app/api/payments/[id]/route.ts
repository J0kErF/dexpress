import { NextRequest, NextResponse } from "next/server";
import { connectToDB } from "@/lib/mongodb";
import Payment from "@/models/Payment";

// GET /api/payments/[id]
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  await connectToDB();

  try {
    const payment = await Payment.findById(params.id);

    if (!payment) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 });
    }

    return NextResponse.json(payment, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch payment" }, { status: 500 });
  }
}

// PUT /api/payments/[id]
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  await connectToDB();

  try {
    const body = await req.json();
    const updated = await Payment.findByIdAndUpdate(params.id, body, {
      new: true,
    });

    if (!updated) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 });
    }

    return NextResponse.json(updated, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update payment" }, { status: 500 });
  }
}

// DELETE /api/payments/[id]
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  await connectToDB();

  try {
    const deleted = await Payment.findByIdAndDelete(params.id);

    if (!deleted) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete payment" }, { status: 500 });
  }
}

export const dynamic = "force-dynamic";
