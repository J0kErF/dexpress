import { connectToDB } from "@/lib/mongodb";
import User from "@/models/User";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest, context: { params: { id: string } }) {
    const param = await context.params;
    return handleGET(req, param.id);
}

async function handleGET(req: NextRequest, id: string) {
    await connectToDB();

    const user = await User.findOne({ clerkId: id });
    if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user);
}
export async function PUT(req: NextRequest, context: { params: { id: string } }) {
    const param = await context.params;
    return handlePUT(req, param.id);
}

async function handlePUT(req: NextRequest, id: string) {
    await connectToDB();
    const data = await req.json();

    const updated = await User.findOneAndUpdate({ clerkId: id }, data, { new: true });

    if (!updated)
        return NextResponse.json({ error: "User not found" }, { status: 404 });

    return NextResponse.json(updated);
}

export async function DELETE(_req: NextRequest, context: { params: { id: string } }) {
    const param = await context.params;
    return handleDELETE(param.id);
}

async function handleDELETE(id: string) {
    await connectToDB();

    const deleted = await User.findOneAndDelete({ clerkId: id });

    if (!deleted)
        return NextResponse.json({ error: "User not found" }, { status: 404 });

    return NextResponse.json({ success: true });
}
