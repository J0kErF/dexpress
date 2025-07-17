import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/mongodb";
import Shipment from "@/models/Shipment"; // עדכן בהתאם לשם המודל שלך
import User from "@/models/User"; // עדכן בהתאם לשם המודל שלך

export async function GET(
  req: Request,
  { params }: any //{ params: { id: string } }
) {
  try {
    await connectToDB();
    const { id } = await params;
    const user = await User.findOne({ clerkId: id });
    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }
    
    const businessId = user.businessId;
    if (!businessId) {
      return NextResponse.json(
        { error: "User does not have a business ID" },
        { status: 404 }
      );
    }
    // שליפת שילוחים שבהם otherDetails[1] שווה ל-id
    const shipments = await Shipment.find({
      $expr: {
        $eq: [{ $arrayElemAt: ["$otherDetails", 1] }, businessId],
      },
    });

    return NextResponse.json(shipments);
  } catch (error) {
    console.error("❌ Error fetching shipments by store ID:", error);
    return NextResponse.json(
      { error: "Failed to fetch shipments" },
      { status: 500 }
    );
  }
}
