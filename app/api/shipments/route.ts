import { connectToDB } from "@/lib/mongodb";
import Shipment from "@/models/Shipment";
import Store from "@/models/Store";
import { NextResponse } from "next/server";
import mongoose from "mongoose";

// פונקציה לבדיקה אם ערך הוא ObjectId תקני
function isValidObjectId(id: any) {
  return mongoose.Types.ObjectId.isValid(id);
}

export async function GET(req: Request) {
  await connectToDB();

  const { searchParams } = new URL(req.url);
  const withStore = searchParams.get("withStore") === "true";

  let shipments = await Shipment.find().sort({ createdAt: -1 }).lean();

  if (withStore) {
    const storeIds = shipments
      .map((s: any) => s.otherDetails?.[1])
      .filter((id): id is string => isValidObjectId(id));

    const stores = await Store.find({ _id: { $in: storeIds } }).lean();
    const storeMap = Object.fromEntries(
      stores.map((s) => [String((s as { _id: string })._id), s])
    );


    shipments = shipments.map((s: any) => {
      const storeId = s.otherDetails?.[1];
      const store = isValidObjectId(storeId) ? storeMap[storeId] : null;

      return {
        ...s,
        store: store
          ? {
            businessName: store.businessName,
            phoneNumber: store.phoneNumber,
            address: store.address?.split(",") || ["לא ידוע", "לא ידוע", "", ""],
          }
          : {
            businessName: "לא ידוע",
            phoneNumber: "",
            address: ["לא ידוע", "לא ידוע", "", ""],
          },
      };
    });
  }

  return NextResponse.json(shipments);
}


// POST a new shipment
export async function POST(req: Request) {
  try {
    const data = await req.json();

    if (!data.customerName || !data.phoneNumber) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    await connectToDB();
    const newShipment = await Shipment.create(data);
    return NextResponse.json(newShipment, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
