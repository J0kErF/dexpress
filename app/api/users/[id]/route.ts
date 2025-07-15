// api/users/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import {connectToDB} from "@/lib/mongodb";
import User from "@/models/User";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  await connectToDB();
  const user = await User.findById(params.id);
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
  return NextResponse.json(user);
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  await connectToDB();
  const data = await req.json();

  try {
    const updated = await User.findByIdAndUpdate(params.id, data, { new: true });
    if (!updated) return NextResponse.json({ error: "User not found" }, { status: 404 });
    return NextResponse.json(updated);
  } catch (err) {
    return NextResponse.json({ error: "Failed to update user", details: err }, { status: 400 });
  }
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  await connectToDB();
  const deleted = await User.findByIdAndDelete(params.id);
  if (!deleted) return NextResponse.json({ error: "User not found" }, { status: 404 });
  return NextResponse.json({ success: true });
}
