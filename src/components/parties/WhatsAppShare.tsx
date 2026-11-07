"use client";

import { L } from "@/lib/labels";

export function WhatsAppShare({ url }: { url: string }) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="rounded-md bg-[#25D366] px-3 py-2 text-sm font-semibold text-white hover:opacity-90"
    >
      {L.whatsapp}
    </a>
  );
}
