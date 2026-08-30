import { NextRequest, NextResponse } from "next/server";
import { generateStrategicSynthesis } from "@/lib/gemini";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, content, sourceName, author, customApiKey, accessPasscode } = body;

    const serverApiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
    const serverPasscode = process.env.APP_ACCESS_PASSWORD;
    const clientPasscode = req.headers.get("x-app-passcode") || accessPasscode;

    // Case 1: Client didn't provide a personal key, and server has no environment key configured (e.g. localhost without .env.local)
    if (!customApiKey && !serverApiKey) {
      return NextResponse.json(
        {
          error:
            "No server API key configured. Please enter your personal Gemini API key in Settings (gear icon), or configure GEMINI_API_KEY in your server environment.",
        },
        { status: 400 }
      );
    }

    // Case 2: Server has an access password configured, and client is trying to use the server key without a valid passcode
    if (serverPasscode && !customApiKey) {
      if (!clientPasscode) {
        return NextResponse.json(
          {
            error: "Access passcode is required to use the server AI quota.",
          },
          { status: 401 }
        );
      }

      if (clientPasscode !== serverPasscode) {
        return NextResponse.json(
          {
            error: "Incorrect passcode. Please check your password or configure your own API key in Settings.",
          },
          { status: 401 }
        );
      }
    }

    if (!title || !content) {
      return NextResponse.json(
        { error: "Title and content are required for strategic synthesis." },
        { status: 400 }
      );
    }

    const synthesis = await generateStrategicSynthesis(
      title,
      content,
      sourceName || "Publication",
      author,
      customApiKey
    );

    return NextResponse.json({ synthesis });
  } catch (error: any) {
    console.error("API /api/synthesize error:", error);
    return NextResponse.json(
      {
        error:
          error.message ||
          "Failed to generate strategic synthesis. Check your Gemini API key.",
      },
      { status: 500 }
    );
  }
}
