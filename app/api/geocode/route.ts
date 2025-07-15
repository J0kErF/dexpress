// /app/api/geocode/route.ts
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const city = searchParams.get("city");

  if (!city) {
    return NextResponse.json({ error: "Missing city parameter" }, { status: 400 });
  }

  try {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
      city + ", ישראל"
    )}&format=json&limit=1&accept-language=he`;

    const response = await fetch(url, {
      headers: {
        "User-Agent": "MyApp/1.0 (admin@example.com)", // חובה לפי תנאים של OSM
      },
    });

    if (!response.ok) {
      return NextResponse.json({ error: "Failed to fetch from OSM" }, { status: 500 });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
