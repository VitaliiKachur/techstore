type ProductImageProps = {
  src: string;
  alt: string;
  className?: string;
};

export default function ProductImage({ src, alt, className = "" }: ProductImageProps) {
  if (isImageSrc(src)) {
    return (
      <div className={`product-image-frame ${className}`}>
        {/* Product images can be local public assets or admin-provided URLs. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img alt={alt} className="product-image" src={src} />
      </div>
    );
  }

  return (
    <div className={`product-visual ${getProductVisualClass(src)} ${className}`}>
      <div className="product-device" />
    </div>
  );
}

function isImageSrc(src: string) {
  return src.startsWith("/") || src.startsWith("http://") || src.startsWith("https://");
}

function getProductVisualClass(image: string) {
  if (image.includes("coral")) return "product-visual-coral";
  if (image.includes("cyan")) return "product-visual-cyan";
  if (image.includes("amber")) return "product-visual-amber";

  return "product-visual-mint";
}
