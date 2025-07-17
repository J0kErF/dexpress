// app/api/routes/[id]/route.ts

import { NextRequest, NextResponse } from "next/server";
import Route from "@/models/Route";
import { connectToDB } from "@/lib/mongodb";

export async function PUT(
  req: NextRequest,
  { params }: any // { params: { id: string } }
) {
  try {
    await connectToDB();
    const data = await req.json();

    if (!params.id || typeof data !== "object") {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const updatedRoute = await Route.findByIdAndUpdate(params.id, data, {
      new: true,
    });

    if (!updatedRoute) {
      return NextResponse.json({ error: "Route not found" }, { status: 404 });
    }

    return NextResponse.json(updatedRoute);
  } catch (error) {
    console.error("PUT /api/routes/[id] error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(
  _: NextRequest,
   { params }: any // { params: { id: string } }
) {
  try {
    await connectToDB();

    const deleted = await Route.findByIdAndDelete(params.id);

    if (!deleted) {
      return NextResponse.json({ error: "Route not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/routes/[id] error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
