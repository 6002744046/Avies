import { NextResponse } from "next/server";
import { generateChatbotReply } from "@/lib/gemini";
import { createServerSupabaseClient } from "@/lib/supabase";
import type { ChatMessage } from "@/lib/types";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { messages: ChatMessage[]; sessionId?: string };
    const messages = body.messages || [];
    const reply = await generateChatbotReply(messages);

    const supabase = createServerSupabaseClient();
    if (supabase) {
      const latestUserMessage = [...messages].reverse().find((message) => message.role === "user");
      const { error } = await supabase.from("chatbot_logs").insert({
        session_id: body.sessionId || `web-${Date.now()}`,
        user_message: latestUserMessage?.content || "",
        assistant_message: reply,
        messages
      });
      if (error) {
        console.error("Chatbot log insert failed", error);
      }
    }

    return NextResponse.json({ reply });
  } catch (error) {
    console.error("Chatbot route failed", error);
    return NextResponse.json(
      {
        reply:
          "I can still help with general hair wellness guidance, but I could not process that message right now."
      },
      { status: 200 }
    );
  }
}
