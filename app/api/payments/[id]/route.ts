import { connectToDB } from "@/lib/mongodb";
import Payment from "@/models/Payment";
import { NextResponse, type NextRequest } from "next/server";

// ✅ Use the correct context type: { params: { id: string } }

export async function GET(
  _req: NextRequest,
  context: { params: { id: string } }
) {
  await connectToDB();
  const { id } = context.params;

  const payment = await Payment.findById(id);
  if (!payment) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(payment);
}

export async function PUT(
  req: NextRequest,
  context: { params: { id: string } }
) {
  const { id } = context.params;
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

export async function DELETE(
  _req: NextRequest,
  context: { params: { id: string } }
) {
  const { id } = context.params;
  await connectToDB();

  const deleted = await Payment.findByIdAndDelete(id);
  if (!deleted) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ success: true });
}

export const dynamic = "force-dynamic";
