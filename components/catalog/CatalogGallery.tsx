"use client";

import { useState } from "react";
import Image from "next/image";

export default function CatalogGallery({ photos, alt, rtl }: { photos: string[]; alt: string; rtl: boolean }) {
  const [index, setIndex] = useState(0);

  if (photos.length === 0) {
    return <div className="aspect-[4/3] w-full rounded-xl bg-gray-100" />;
  }

  const prev = () => setIndex((i) => (i - 1 + photos.length) % photos.length);
  const next = () => setIndex((i) => (i + 1) % photos.length);

  return (
    <div>
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-gray-100">
        <Image
          src={photos[index]}
          alt={alt}
          fill
          sizes="(max-width: 768px) 100vw, 800px"
          className="object-cover"
          priority
        />
        {photos.length > 1 && (
          <>
            <button
              aria-label="Previous photo"
              onClick={rtl ? next : prev}
              className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 px-3 py-2 text-white"
            >
              ‹
            </button>
            <button
              aria-label="Next photo"
              onClick={rtl ? prev : next}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 px-3 py-2 text-white"
            >
              ›
            </button>
            <span className="absolute bottom-2 right-2 rounded-full bg-black/60 px-2.5 py-1 text-xs font-medium text-white">
              {index + 1} / {photos.length}
            </span>
          </>
        )}
      </div>
      {photos.length > 1 && (
        <div className="mt-2 grid grid-cols-5 gap-1.5 sm:grid-cols-7">
          {photos.map((p, i) => (
            <button
              key={p}
              onClick={() => setIndex(i)}
              className={`relative aspect-square overflow-hidden rounded-md ${
                i === index ? "ring-2 ring-amber-500" : "opacity-70 hover:opacity-100"
              }`}
            >
              <Image src={p} alt="" fill sizes="120px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
