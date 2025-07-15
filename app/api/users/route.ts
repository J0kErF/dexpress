// app/api/users/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectToDB } from "@/lib/mongodb";
import User from "@/models/User";

export async function GET(req: NextRequest) {
  await connectToDB();

  const role = req.nextUrl.searchParams.get("role");
  let query = {};

  if (role) {
    query = { role };
  }

  const users = await User.find(query);
  return NextResponse.json(users);
}

export async function POST(req: Request) {
  await connectToDB();
  const body = await req.json();

  try {
    const user = await User.create(body);
    return NextResponse.json(user, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: "User creation failed", details: err }, { status: 400 });
  }
}
