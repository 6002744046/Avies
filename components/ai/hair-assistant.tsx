"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, MessageCircle, Send, X } from "lucide-react";
import type { ChatMessage } from "@/lib/types";

const starter: ChatMessage = {
  role: "assistant",
  content:
    "I can map your hair recovery path. What is your age, hair loss pattern, duration, and family history?"
};

export function HairAssistant() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([starter]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const content = input.trim();
    if (!content || loading) {
      return;
    }

    const nextMessages: ChatMessage[] = [...messages, { role: "user", content }];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("/api/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextMessages })
      });
      const data = await response.json();
      setMessages([...nextMessages, { role: "assistant", content: data.reply }]);
    } catch {
      setMessages([
        ...nextMessages,
        {
          role: "assistant",
          content:
            "I had trouble reaching the assistant. You can still start the guided analysis and get a structured plan."
        }
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed bottom-24 right-5 z-50 md:bottom-5">
      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ opacity: 0, y: 18, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 18, scale: 0.96 }}
            className="mb-3 flex h-[560px] w-[min(380px,calc(100vw-40px))] flex-col overflow-hidden rounded-2xl border border-white/10 bg-ink/90 shadow-glow backdrop-blur-xl"
          >
            <div className="flex items-center justify-between border-b border-white/10 p-4">
              <div className="flex items-center gap-3">
                <span className="grid size-10 place-items-center rounded-lg bg-aqua/10 text-aqua">
                  <Bot className="size-5" />
                </span>
                <div>
                  <p className="text-sm font-bold text-white">AviEx Hair Assistant</p>
                  <p className="text-xs text-white/50">General guidance only</p>
                </div>
              </div>
              <button
                aria-label="Close assistant"
                className="grid size-9 place-items-center rounded-2xl text-white/70 transition hover:bg-white/10 hover:text-white"
                onClick={() => setOpen(false)}
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="no-scrollbar flex-1 space-y-3 overflow-y-auto p-4">
              {messages.map((message, index) => (
                <div
                  key={`${message.role}-${index}`}
                  className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                  className={`max-w-[84%] rounded-2xl px-4 py-3 text-sm leading-6 ${
                      message.role === "user"
                        ? "bg-aqua text-ink"
                        : "border border-white/10 bg-white/10 text-white/90"
                    }`}
                  >
                    {message.content}
                  </div>
                </div>
              ))}
              {loading ? (
                <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white/60">
                  Analyzing your answers...
                </div>
              ) : null}
              <div ref={bottomRef} />
            </div>

            <form onSubmit={submit} className="flex gap-2 border-t border-white/10 p-3">
              <input
                value={input}
                onChange={(event) => setInput(event.target.value)}
                className="min-w-0 flex-1 rounded-2xl border border-white/10 bg-white/10 px-3 text-sm text-white outline-none placeholder:text-white/40 focus:border-aqua"
                placeholder="Type your answer"
              />
              <button
                aria-label="Send message"
                className="grid size-11 place-items-center rounded-2xl bg-aqua text-ink transition hover:bg-white disabled:opacity-60"
                disabled={loading}
              >
                <Send className="size-4" />
              </button>
            </form>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <button
        aria-label="Open hair assistant"
        onClick={() => setOpen((value) => !value)}
        className="grid size-14 place-items-center rounded-2xl border border-white/20 bg-ink text-white shadow-glow transition hover:-translate-y-0.5"
      >
        <MessageCircle className="size-6" />
      </button>
    </div>
  );
}
