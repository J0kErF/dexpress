import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/mongodb";
import Shipment from "@/models/Shipment";
import Store from "@/models/Store";
import mongoose from "mongoose";

export async function GET() {
  try {
    await connectToDB();

    const rawShipments = await Shipment.find().lean();
    console.log("🚚 Total shipments fetched:", rawShipments.length);

    const validStatuses = ["בהמתנה", "בסניף", "pending", "in_store"];
    const shipments = rawShipments.filter((s) =>
      validStatuses.includes(s.otherDetails?.[0])
    );
    console.log("✅ Filtered by status:", shipments.length);

    const rawStoreIds = shipments
      .map((s) => s.otherDetails?.[1])
      .filter((id): id is string => !!id);
    const uniqueStoreIds = [...new Set(rawStoreIds)];

    const validObjectIds = uniqueStoreIds
      .filter((id) => mongoose.Types.ObjectId.isValid(id))
      .map((id) => new mongoose.Types.ObjectId(id));
    console.log("🏪 Valid store ObjectIds:", validObjectIds.length);

    const stores = await Store.find({ _id: { $in: validObjectIds } }).lean();
    console.log("🏪 Fetched stores:", stores.length);

    const storeMap = Object.fromEntries(
      stores.map((s) => [(s._id as mongoose.Types.ObjectId | string).toString(), s])
    );

    const enriched = [];
    let waitWithCoords = 0;
    let waitWithoutCoords = 0;
    let storeWithCoords = 0;
    let storeWithoutCoords = 0;

    for (const shipment of shipments) {
      const [city, street, lng, lat] = shipment.address || [];

      const hasCoords = lat && lng;
      const status = shipment.otherDetails?.[0];

      if (status === "בהמתנה" || status === "pending") {
        if (hasCoords) waitWithCoords++;
        else waitWithoutCoords++;
      }

      if (status === "בסניף" || status === "in_store") {
        if (hasCoords) storeWithCoords++;
        else storeWithoutCoords++;
      }

      if (!hasCoords) {
        console.warn(`❌ Missing coords for shipment: ${shipment._id}`);
        continue;
      }

      const coords: [number, number] = [lat, lng];

      const storeId = shipment.otherDetails?.[1];
      const store = storeMap[storeId || ""];

      enriched.push({
        ...shipment,
        coords,
        store: store
          ? {
              id: (store._id as mongoose.Types.ObjectId | string).toString(),
              businessName: store.businessName,
              phoneNumber: store.phoneNumber,
              address: store.address,
            }
          : null,
      });
    }

    console.log("📍 Enriched shipments with coords:", enriched.length);

    return NextResponse.json({
      shipments: enriched,
      summary: {
        waitWithCoords,
        waitWithoutCoords,
        storeWithCoords,
        storeWithoutCoords,
      },
    });
  } catch (err: any) {
    console.error("❌ API Error in /api/map-shipments:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
