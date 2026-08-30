import { StrategicSynthesis } from "@/types";

// Free tier strictly supports Flash models with 1500 RPD (Pro models have limit: 0 on free tier)
const FLASH_MODEL_PRIORITY = [
  "models/gemini-2.0-flash",
  "models/gemini-2.0-flash-001",
  "models/gemini-1.5-flash",
  "models/gemini-1.5-flash-latest",
  "models/gemini-1.5-flash-001",
  "models/gemini-1.5-flash-002",
  "models/gemini-1.5-flash-8b",
];

export async function generateStrategicSynthesis(
  title: string,
  content: string,
  sourceName: string,
  author?: string,
  customApiKey?: string
): Promise<StrategicSynthesis> {
  const apiKey =
    customApiKey ||
    process.env.GEMINI_API_KEY ||
    process.env.GOOGLE_API_KEY;

  if (!apiKey) {
    throw new Error(
      "No Gemini API Key provided. Please add your free GEMINI_API_KEY in preferences."
    );
  }

  // Discover candidate models
  let candidateModels: string[] = [...FLASH_MODEL_PRIORITY];

  try {
    const listRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
    );
    const listData = await listRes.json();

    if (listRes.ok && Array.isArray(listData.models)) {
      const allGenModels = listData.models
        .filter((m: any) => m.supportedGenerationMethods?.includes("generateContent"))
        .map((m: any) => (m.name.startsWith("models/") ? m.name : `models/${m.name}`));

      // Prioritize Flash models first (100% free tier supported)
      const flashModels = allGenModels.filter((name: string) => name.toLowerCase().includes("flash"));
      const otherModels = allGenModels.filter((name: string) => !name.toLowerCase().includes("flash"));

      candidateModels = Array.from(
        new Set([...flashModels, ...FLASH_MODEL_PRIORITY, ...otherModels])
      );
    }
  } catch (err) {
    console.warn("Could not fetch model list, using default priority list:", err);
  }

  const prompt = `
You are an executive strategic advisor to a Senior Product Manager (SPM).
Your goal is to extract high-leverage, non-obvious strategic insights, business model analysis, and mental models from the following publication.

Article Title: "${title}"
Author/Source: ${author || sourceName}
Content:
"""
${content.slice(0, 8000)}
"""

Provide your strategic analysis strictly in valid JSON format matching this exact schema:
{
  "strategicThesis": "1-2 crisp, rigorous sentences describing the core underlying strategic shift, thesis, or business model dynamics presented.",
  "productMarketImplication": "2-3 sentences explaining the tangible implications for product strategy, roadmaps, B2B SaaS economics (pricing/retention/GTM) or B2C consumer dynamics (network effects/growth loops).",
  "mentalModelApplied": "Name of 1-2 primary mental models or strategic frameworks directly applicable here (e.g., Aggregation Theory, Second-Order Thinking, Switching Costs, Local Maximum, Asymmetric Upside, Jobs To Be Done, Network Effects, Inversion) followed by a 1-sentence note on how to use it.",
  "keyTakeaways": [
    "Takeaway 1: High-signal executive point on market or technology dynamics.",
    "Takeaway 2: High-signal point on product prioritization or execution trade-off.",
    "Takeaway 3: High-signal point on long-term competitive moat or strategic edge."
  ]
}

Return ONLY valid JSON.
`;

  let lastError: any = null;
  let rawText = "";

  // Try candidate Flash models in priority order
  for (const modelPath of candidateModels) {
    try {
      const generateUrl = `https://generativelanguage.googleapis.com/v1beta/${modelPath}:generateContent?key=${apiKey}`;

      const res = await fetch(generateUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            responseMimeType: "application/json",
            temperature: 0.2,
          },
        }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        // If quota exceeded on this specific model or not found, try the next Flash candidate
        console.warn(`Model ${modelPath} failed:`, data.error?.message || res.statusText);
        lastError = new Error(data.error?.message || `Generation error on ${modelPath}`);
        continue;
      }

      rawText = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";
      if (rawText) {
        break; // Successfully generated!
      }
    } catch (err: any) {
      console.warn(`Request failed for ${modelPath}:`, err.message || err);
      lastError = err;
    }
  }

  if (!rawText) {
    throw new Error(
      lastError?.message || "Failed to generate synthesis with any available Flash model."
    );
  }

  // Clean output in case model returned markdown fences
  const cleanedText = rawText
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```$/i, "")
    .trim();

  try {
    const parsed = JSON.parse(cleanedText);
    return {
      strategicThesis: parsed.strategicThesis || "Analysis generated.",
      productMarketImplication:
        parsed.productMarketImplication || "Implications analyzed.",
      mentalModelApplied:
        parsed.mentalModelApplied || "Strategic Framework applied.",
      keyTakeaways: Array.isArray(parsed.keyTakeaways)
        ? parsed.keyTakeaways
        : [
            "Focus on core business model leverage.",
            "Evaluate second-order impacts on product strategy.",
            "Strengthen competitive moats.",
          ],
      analyzedAt: new Date().toISOString(),
    };
  } catch (err) {
    console.error("Failed to parse Gemini response as JSON:", rawText);
    return {
      strategicThesis: rawText.slice(0, 300),
      productMarketImplication: "Review full article for detailed implications.",
      mentalModelApplied: "First-Principles Thinking & Strategic Positioning",
      keyTakeaways: [
        "Synthesized from article text.",
        "Reflects key product strategy insights.",
        "Apply to strategic decision making.",
      ],
      analyzedAt: new Date().toISOString(),
    };
  }
}
