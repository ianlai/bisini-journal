// src/components/Collapsible.tsx
"use client";
import React, { useEffect, useLayoutEffect, useRef, useState } from "react";

type Props = {
  open: boolean;
  duration?: number; // ms
  children: React.ReactNode;
  className?: string;
};

export default function Collapsible({
  open,
  duration = 300,
  children,
  className = "",
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  // 進場初始化：若一開始就是展開，直接給 auto（不要播動畫）
  useLayoutEffect(() => {
    setMounted(true);
    const el = ref.current;
    if (!el) return;
    if (open) {
      el.style.height = "auto";
      el.style.overflow = "hidden";
      el.style.transition = "";
    } else {
      el.style.height = "0px";
      el.style.overflow = "hidden";
      el.style.transition = `height ${duration}ms ease`;
    }
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el || !mounted) return;

    const prefersReduced = window.matchMedia?.(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const toAuto = () => {
      // 動畫結束後，恢復 auto（展開狀態）
      el.style.height = "auto";
      el.style.overflow = "hidden";
      el.removeEventListener("transitionend", toAuto);
    };

    if (prefersReduced) {
      // 依無障礙偏好，直接切換
      el.style.transition = "";
      el.style.height = open ? "auto" : "0px";
      return;
    }

    // 確保只 transition height
    el.style.transition = `height ${duration}ms ease`;
    el.style.overflow = "hidden";
    el.style.willChange = "height";

    if (open) {
      // 關 -> 開：0 → scrollHeight → auto
      // Step 1: 先從 0（或目前高度）開始
      const start = el.offsetHeight; // 觸發 reflow
      void start;

      // Step 2: 下一幀把高度設為內容實際高度
      requestAnimationFrame(() => {
        const target = el.scrollHeight;
        el.style.height = `${target}px`;

        // Step 3: 動畫結束後設回 auto
        el.addEventListener("transitionend", toAuto, { once: true });
      });
    } else {
      // 開 -> 關：auto → 固定現在高度 → 0
      // 先把 auto 鎖定成目前實際高度，避免 auto→0 沒有補間
      const current = el.scrollHeight;
      el.style.height = `${current}px`;

      // 強制 reflow，讓下一步的 0 有動畫
      const _ = el.offsetHeight;
      void _;

      requestAnimationFrame(() => {
        el.style.height = "0px";
        // 關閉不需要把 height 設回 auto
      });
    }
  }, [open, duration, mounted]);

  return (
    <div ref={ref} className={className} style={{ overflow: "hidden" }}>
      {children}
    </div>
  );
}
