import { NextRequest, NextResponse } from "next/server";
import { generateStrategicSynthesis } from "@/lib/gemini";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, content, sourceName, author, customApiKey, accessPasscode } = body;

    const serverPasscode = process.env.APP_ACCESS_PASSWORD;
    const clientPasscode = req.headers.get("x-app-passcode") || accessPasscode;

    // If server has set an APP_ACCESS_PASSWORD and no custom BYOK key is provided:
    if (serverPasscode && !customApiKey) {
      if (!clientPasscode || clientPasscode !== serverPasscode) {
        return NextResponse.json(
          {
            error:
              "Protected feed: Access passcode is required to use the server AI quota. Please enter it in Preferences (gear icon).",
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
