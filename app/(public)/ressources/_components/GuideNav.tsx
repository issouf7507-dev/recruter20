"use client";

import { useEffect, useState } from "react";

type NavItem = { id: string; title: string; accent: string };

export function GuideNav({ items }: { items: NavItem[] }) {
  const [active, setActive] = useState(items[0]?.id ?? "");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length > 0) setActive(visible[0].target.id);
      },
      { rootMargin: "-25% 0px -60% 0px", threshold: 0 }
    );

    const nodes = items
      .map((i) => document.getElementById(i.id))
      .filter((n): n is HTMLElement => n !== null);
    nodes.forEach((n) => observer.observe(n));

    return () => observer.disconnect();
  }, [items]);

  return (
    <nav aria-label="Sommaire des guides" className="lg:sticky lg:top-28">
      <p
        className="hidden lg:block text-[11px] font-semibold uppercase tracking-widest mb-4"
        style={{ color: "var(--y-ink-4)" }}
      >
        Sommaire
      </p>

      <ul className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible -mx-6 px-6 lg:mx-0 lg:px-0 pb-1 lg:pb-0">
        {items.map((item) => {
          const isActive = active === item.id;
          return (
            <li key={item.id} className="shrink-0">
              <a
                href={`#${item.id}`}
                aria-current={isActive ? "true" : undefined}
                className="relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors whitespace-nowrap lg:whitespace-normal"
                style={{
                  background: isActive ? "var(--y-bg-pure)" : "transparent",
                  color: isActive ? "var(--y-ink)" : "var(--y-ink-3)",
                  fontWeight: isActive ? 600 : 400,
                  boxShadow: isActive ? "var(--y-shadow-sm)" : "none",
                }}
              >
                <span
                  className="w-1 h-4 rounded-full shrink-0 transition-opacity"
                  style={{ background: item.accent, opacity: isActive ? 1 : 0.25 }}
                />
                {item.title}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
