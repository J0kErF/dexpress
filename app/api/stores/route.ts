import { connectToDB } from "@/lib/mongodb";
import Store from "@/models/Store";
import { NextRequest, NextResponse } from "next/server";


// GET stores — all or by comma-separated ids
export async function GET(req: NextRequest) {
  try {
    await connectToDB();

    const idsParam = req.nextUrl.searchParams.get("ids");

    // If no ?ids param → return all stores
    if (!idsParam) {
      const stores = await Store.find().sort({ createdAt: -1 });
      return NextResponse.json(stores);
    }

    // If ?ids=id1,id2,... → fetch by _id
    const ids = idsParam.split(",");
    const stores = await Store.find({ _id: { $in: ids } }).lean();

    return NextResponse.json(
      stores.map((store: any) => ({
        id: (store._id as any).toString(),
        businessName: store.businessName,
        phoneNumber: store.phoneNumber,
        address: store.address,
      }))
    );
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST a new store
export async function POST(req: Request) {
  try {
    await connectToDB();
    const body = await req.json();
    const newStore = await Store.create(body);
    return NextResponse.json(newStore, { status: 201 });
  } catch (err: any) {
    console.error("❌ Store creation error:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
