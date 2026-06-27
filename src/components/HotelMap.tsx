"use client";

import dynamic from "next/dynamic";

// Leaflet gebruikt `window`, dus laden zonder server-side rendering.
const AmsterdamMap = dynamic(() => import("./AmsterdamMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center text-sm text-neutral-500">
      Kaart laden…
    </div>
  ),
});

export default function HotelMap() {
  return (
    <div className="h-80 w-full overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900">
      <AmsterdamMap />
    </div>
  );
}
