import { connectToDB } from "@/lib/mongodb";
import Payment from "@/models/Payment";
import { NextResponse } from "next/server";

// GET all payments for a specific store
export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDB();
    const { id } = await params;

    const payments = await Payment.find({ storeId: id }).sort({ createdAt: -1 });

    return NextResponse.json(payments);
  } catch (err: any) {
    console.error("❌ Payment store GET error:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export const dynamic = "force-dynamic";
