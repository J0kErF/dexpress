import { NextRequest, NextResponse } from "next/server";
import { connectToDB } from "@/lib/mongodb";
import Payment from "@/models/Payment";

// GET /api/payments/[id]
export async function GET(
  _req: NextRequest,
  context: any // { params: { id: string } }
) {
  try {
    await connectToDB();
    const { id } = context.params;

    const payment = await Payment.findById(id).lean();
    if (!payment) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 });
    }

    return NextResponse.json(payment, { status: 200 });
  } catch (error: any) {
    console.error("GET /api/payments/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to fetch payment", details: error.message },
      { status: 500 }
    );
  }
}

// PUT /api/payments/[id]
export async function PUT(
  req: NextRequest,
  context: any //{ params: { id: string } }
) {
  try {
    await connectToDB();
    const { id } = context.params;
    const body = await req.json();

    const updated = await Payment.findByIdAndUpdate(id, body, { new: true }).lean();
    if (!updated) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 });
    }

    return NextResponse.json(updated, { status: 200 });
  } catch (error: any) {
    console.error("PUT /api/payments/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to update payment", details: error.message },
      { status: 500 }
    );
  }
}

// DELETE /api/payments/[id]
export async function DELETE(
  _req: NextRequest,
  context: any // { params: { id: string } }
) {
  try {
    await connectToDB();
    const { id } = context.params;

    const deleted = await Payment.findByIdAndDelete(id).lean();
    if (!deleted) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "Payment deleted successfully",
    });
  } catch (error: any) {
    console.error("DELETE /api/payments/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to delete payment", details: error.message },
      { status: 500 }
    );
  }
}

// Enable dynamic rendering to ensure DB operations are fresh
export const dynamic = "force-dynamic";
