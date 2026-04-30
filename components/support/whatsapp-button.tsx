"use client";

import { MessageCircle } from "lucide-react";

export function WhatsAppButton() {
  const number = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "";

  if (!number) {
    return null;
  }

  return (
    <a
      href={`https://wa.me/${number}`}
      target="_blank"
      rel="noreferrer"
      aria-label="Open WhatsApp support"
      className="fixed bottom-24 left-4 z-50 grid size-14 place-items-center rounded-2xl border border-leaf/30 bg-leaf text-ink shadow-glow transition hover:-translate-y-0.5 md:bottom-6 md:left-6"
    >
      <MessageCircle className="size-6" />
    </a>
  );
}
