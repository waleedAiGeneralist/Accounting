"use client";

import { Tx } from "@/components/i18n/Tx";

export function WhatsAppShare({ url }: { url: string }) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="rounded-md bg-[#25D366] px-3 py-2 text-sm font-semibold text-white hover:opacity-90"
    >
      <Tx k="whatsapp" />
    </a>
  );
}
