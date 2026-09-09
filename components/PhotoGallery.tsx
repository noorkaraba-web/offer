"use client";

import { useState } from "react";
import Image from "next/image";

export default function PhotoGallery({ photos, alt }: { photos: string[]; alt: string }) {
  const [index, setIndex] = useState(0);

  if (photos.length === 0) {
    return <div className="aspect-[4/3] w-full rounded-xl bg-gray-200" />;
  }

  return (
    <div>
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-gray-200">
        <Image
          src={photos[index]}
          alt={alt}
          fill
          sizes="(max-width: 768px) 100vw, 768px"
          className="object-cover"
          priority
        />
        {photos.length > 1 && (
          <>
            <button
              aria-label="Previous photo"
              onClick={() => setIndex((i) => (i - 1 + photos.length) % photos.length)}
              className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/40 px-3 py-2 text-white"
            >
              ‹
            </button>
            <button
              aria-label="Next photo"
              onClick={() => setIndex((i) => (i + 1) % photos.length)}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/40 px-3 py-2 text-white"
            >
              ›
            </button>
            <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1.5">
              {photos.map((_, i) => (
                <button
                  key={i}
                  aria-label={`Go to photo ${i + 1}`}
                  onClick={() => setIndex(i)}
                  className={`h-1.5 w-1.5 rounded-full ${i === index ? "bg-white" : "bg-white/50"}`}
                />
              ))}
            </div>
          </>
        )}
      </div>
      <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
        {photos.map((p, i) => (
          <button
            key={p}
            onClick={() => setIndex(i)}
            className={`relative h-14 w-20 flex-shrink-0 overflow-hidden rounded-md ${
              i === index ? "ring-2 ring-carnect" : "opacity-70"
            }`}
          >
            <Image src={p} alt="" fill sizes="80px" className="object-cover" />
          </button>
        ))}
      </div>
    </div>
  );
}
