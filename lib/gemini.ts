import { GoogleGenerativeAI } from "@google/generative-ai";
import { env, featureFlags } from "./env";
import { demoAnalysis } from "./recommendations";
import type { AnalysisInput, ChatMessage } from "./types";

const safetyInstruction =
  "You are an AI hair wellness assistant. Do not provide a medical diagnosis, prescription, or guaranteed outcome. Give general educational guidance only and advise clinician review for medications or severe symptoms.";

export async function generateHairSummary(input: AnalysisInput) {
  const fallback = demoAnalysis(input).ai_summary;

  if (!featureFlags.gemini) {
    return fallback;
  }

  try {
    const genAI = new GoogleGenerativeAI(env.geminiApiKey);
    const model = genAI.getGenerativeModel({ model: env.geminiModel });
    const prompt = `${safetyInstruction}

Create a concise premium hair analysis summary in 90 words or fewer.
Input JSON:
${JSON.stringify(input, null, 2)}

Requirements:
- Explain likely contributing factors without diagnosing.
- Mention that results vary.
- Recommend starting the personalized 90-day plan and progress photos.`;

    const result = await model.generateContent(prompt);
    return result.response.text() || fallback;
  } catch (error) {
    console.error("Gemini analysis failed", error);
    return fallback;
  }
}

export async function generateChatbotReply(messages: ChatMessage[]) {
  const latest = messages[messages.length - 1]?.content || "";
  const fallback =
    latest.length < 12
      ? "I can help map your hair recovery plan. Tell me your age, hair loss pattern, how long it has been happening, and whether hair loss runs in your family."
      : "Thanks. Based on what you shared, the next best step is a structured analysis so we can estimate your stage, risk level, and 90-day plan. I can guide you, but this is general information and not a diagnosis.";

  if (!featureFlags.gemini) {
    return fallback;
  }

  try {
    const genAI = new GoogleGenerativeAI(env.geminiApiKey);
    const model = genAI.getGenerativeModel({ model: env.geminiModel });
    const conversation = messages
      .slice(-10)
      .map((message) => `${message.role.toUpperCase()}: ${message.content}`)
      .join("\n");
    const result = await model.generateContent(`${safetyInstruction}

Guide the user through this flow:
1. Ask age.
2. Ask hair loss pattern.
3. Ask duration.
4. Ask family history.
5. Summarize possible contributing factors.
6. Recommend a general plan and link them toward the analysis flow.

Keep replies under 90 words, premium, calm, and conversion-oriented.

Conversation:
${conversation}`);

    return result.response.text() || fallback;
  } catch (error) {
    console.error("Gemini chatbot failed", error);
    return fallback;
  }
}
