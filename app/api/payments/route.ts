import { connectToDB } from "@/lib/mongodb"; 
import Payment from "@/models/Payment";
import Shipment from "@/models/Shipment";

import { NextResponse } from "next/server";

// GET all payments
export async function GET() {
  try {
    await connectToDB();
    const payments = await Payment.find()
      .sort({ createdAt: -1 });

    return NextResponse.json(payments);
  } catch (err: any) {
    console.error("❌ Payment GET error:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST a new payment// POST a new payment
export async function POST(req: Request) {
  try {
    await connectToDB();
    const body = await req.json();

    const newPayment = await Payment.create(body);

    // ✅ Update each shipment as paid
    const results = await Promise.allSettled(
      body.orders.map((shipmentId: string) =>
        Shipment.findByIdAndUpdate(shipmentId, { isPaid: true })
      )
    );

    // ✅ Prepare feedback to send back to client
    const updatedOrders: string[] = [];
    const failedOrders: string[] = [];

    results.forEach((res, index) => {
      const orderId = body.orders[index];
      if (res.status === "fulfilled") updatedOrders.push(orderId);
      else failedOrders.push(orderId);
    });

    return NextResponse.json(
      {
        payment: newPayment,
        updatedOrders,
        failedOrders,
      },
      { status: 201 }
    );
  } catch (err: any) {
    console.error("❌ Payment POST error:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
