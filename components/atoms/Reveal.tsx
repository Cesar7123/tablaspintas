"use client";

import { useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function Reveal({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const element = ref.current;
    if (!element || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const context = gsap.context(() => {
      gsap.from(element, { opacity: 0, y: 20, duration: 0.45, ease: "power2.out", scrollTrigger: { trigger: element, start: "top 88%", once: true } });
    }, element);
    return () => context.revert();
  }, []);
  return <div ref={ref} className={className}>{children}</div>;
}
