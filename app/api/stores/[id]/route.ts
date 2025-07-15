import { connectToDB } from "@/lib/mongodb";
import Store from "@/models/Store";
import { NextResponse } from "next/server";

// GET store by ID
export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  await connectToDB();
  const { id } = await params;

  const store = await Store.findById(id);
  if (!store) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(store);
}

// PUT: Replace the whole store document
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { id } = await params;
  const body = await req.json();
  await connectToDB();

  try {
    const updated = await Store.findByIdAndUpdate(id, body, { new: true });
    if (!updated) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json(updated);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// PATCH: Update specific fields of the store
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { id } = await params;
  const body = await req.json();
  await connectToDB();

  try {
    const updated = await Store.findByIdAndUpdate(
      id,
      { $set: body },
      { new: true }
    );
    if (!updated) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json(updated);
  } catch (err: any) {
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}

// DELETE store by ID
export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const { id } = await params;
  await connectToDB();

  const deleted = await Store.findByIdAndDelete(id);
  if (!deleted) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ success: true });
}

export const dynamic = "force-dynamic";
