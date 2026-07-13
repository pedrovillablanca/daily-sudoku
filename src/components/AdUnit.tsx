"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

declare global {
  interface Window {
    adsbygoogle: unknown[];
  }
}

export default function AdUnit() {
  const pathname = usePathname();
  const adsLoaded = useRef(false);

  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;

    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
      adsLoaded.current = true;
    } catch {
      setTimeout(() => {
        try {
          (window.adsbygoogle = window.adsbygoogle || []).push({});
        } catch {
          // AdSense not ready yet
        }
      }, 750);
    }
  }, [pathname]);

  if (process.env.NODE_ENV !== "production") return null;

  const client = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;
  if (!client) return null;

  return (
    <div className="w-full flex justify-center mt-8 mb-4">
      <ins
        className="adsbygoogle block"
        style={{ display: "block" }}
        data-ad-client={client}
        data-ad-slot="0"
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}
