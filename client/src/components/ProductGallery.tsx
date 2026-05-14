"use client";

import { useEffect, useMemo, useState } from "react";
import ProductImage from "@/components/ProductImage";

type ProductGalleryProps = {
  title: string;
  mainImage: string;
  galleryImages: string[];
};

export default function ProductGallery({
  title,
  mainImage,
  galleryImages,
}: ProductGalleryProps) {
  const images = useMemo(() => [mainImage, ...galleryImages].filter(Boolean), [mainImage, galleryImages]);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const activeImage = activeIndex === null ? null : images[activeIndex];

  useEffect(() => {
    if (activeIndex === null) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setActiveIndex(null);
      }
      if (event.key === "ArrowLeft") {
        setActiveIndex((current) =>
          current === null ? current : (current - 1 + images.length) % images.length
        );
      }
      if (event.key === "ArrowRight") {
        setActiveIndex((current) =>
          current === null ? current : (current + 1) % images.length
        );
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeIndex, images.length]);

  return (
    <div>
      <button
        aria-label={`Відкрити фото ${title}`}
        className="block w-full rounded-lg border border-[var(--border)] bg-[var(--page)] p-4 text-left transition hover:border-[var(--accent)]"
        onClick={() => setActiveIndex(0)}
        type="button"
      >
        <ProductImage alt={title} className="min-h-[420px]" src={mainImage} />
      </button>

      {galleryImages.length > 0 ? (
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {galleryImages.map((image, index) => (
            <button
              aria-label={`Відкрити фото ${index + 2} товару ${title}`}
              className="rounded-md text-left transition hover:scale-[1.01]"
              key={`${image.slice(0, 24)}-${index}`}
              onClick={() => setActiveIndex(index + 1)}
              type="button"
            >
              <ProductImage
                alt={`${title} фото ${index + 2}`}
                className="min-h-[150px] rounded-md border border-[var(--border)]"
                src={image}
              />
            </button>
          ))}
        </div>
      ) : null}

      {activeImage && activeIndex !== null ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setActiveIndex(null)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="w-full max-w-5xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-3 flex items-center justify-between gap-3">
              <p className="text-sm font-black text-white">
                {activeIndex + 1} / {images.length}
              </p>
              <button
                className="h-10 rounded-md bg-white px-4 text-sm font-black text-[#111827]"
                onClick={() => setActiveIndex(null)}
                type="button"
              >
                Закрити
              </button>
            </div>
            <div className="rounded-lg border border-white/20 bg-[var(--page)] p-3">
              <ProductImage alt={title} className="max-h-[78vh] min-h-[320px]" src={activeImage} />
            </div>
            {images.length > 1 ? (
              <div className="mt-3 flex justify-center gap-3">
                <button
                  className="h-10 rounded-md border border-white/30 px-4 text-sm font-black text-white"
                  onClick={() =>
                    setActiveIndex((current) =>
                      current === null ? current : (current - 1 + images.length) % images.length
                    )
                  }
                  type="button"
                >
                  Назад
                </button>
                <button
                  className="h-10 rounded-md border border-white/30 px-4 text-sm font-black text-white"
                  onClick={() =>
                    setActiveIndex((current) =>
                      current === null ? current : (current + 1) % images.length
                    )
                  }
                  type="button"
                >
                  Далі
                </button>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
