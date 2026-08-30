import { NextRequest, NextResponse } from "next/server";
import { discoverFeedUrl } from "@/lib/discover";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { url } = body;

    if (!url || typeof url !== "string") {
      return NextResponse.json(
        { error: "A valid website or feed URL is required." },
        { status: 400 }
      );
    }

    const discovered = await discoverFeedUrl(url);

    if (!discovered) {
      return NextResponse.json(
        {
          error:
            "Could not automatically detect an RSS or Atom feed for this website. Please provide the direct RSS feed URL.",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      ...discovered,
    });
  } catch (error: any) {
    console.error("Discovery API error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to discover feed." },
      { status: 500 }
    );
  }
}
