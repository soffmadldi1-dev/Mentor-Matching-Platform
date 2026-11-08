"use client";

import { useState } from "react";

// 클립보드 복사. 권한이 막힌 브라우저에서는 텍스트 선택 방식으로 대신한다.
export function CopyButton({ text, label = "프롬프트 복사하기", className = "btn-primary" }: { text: string; label?: string; className?: string }) {
  const [state, setState] = useState<"idle" | "done" | "fail">("idle");

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setState("done");
    } catch {
      try {
        const ta = document.createElement("textarea");
        ta.value = text;
        ta.setAttribute("readonly", "");
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        const ok = document.execCommand("copy");
        document.body.removeChild(ta);
        setState(ok ? "done" : "fail");
      } catch {
        setState("fail");
      }
    }
    setTimeout(() => setState("idle"), 2500);
  }

  return (
    <button type="button" onClick={copy} className={className} aria-live="polite">
      {state === "done" ? "복사했습니다" : state === "fail" ? "복사 실패 · 직접 선택해 주세요" : label}
    </button>
  );
}
