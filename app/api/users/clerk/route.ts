import { connectToDB } from "@/lib/mongodb";
import User from "@/models/User";
import { NextRequest, NextResponse } from "next/server";


// POST create user
export async function POST(req: Request) {
    await connectToDB();
    const body = await req.json();
    const { clerkId, fullName, role, businessId } = body;

    if (!clerkId || !fullName || !role) {
        return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const existing = await User.findOne({ clerkId });
    if (existing) {
        return NextResponse.json({ error: "User already exists" }, { status: 409 });
    }

    const user = await User.create({ clerkId, fullName, role, businessId });
    return NextResponse.json(user, { status: 201 });
}

// PUT update user
export async function PUT(req: Request) {
    await connectToDB();
    const body = await req.json();
    const { clerkId, ...updates } = body;

    if (!clerkId) {
        return NextResponse.json({ error: "Missing clerkId" }, { status: 400 });
    }

    const user = await User.findOneAndUpdate({ clerkId }, updates, { new: true, upsert: false });

    if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user);
}
