export function ImageFrame({ src, alt }: { src: string; alt: string }) {
  return <div className="image-frame"><img src={src} alt={alt} loading="lazy" /></div>;
}
