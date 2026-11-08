"use client";

import { startTransition, useActionState, useState, type FormEvent } from "react";
import Link from "next/link";
import { joinWaitlist, type WaitlistState } from "@/app/_actions/waitlist";
import { FIELDS, type FieldSlug } from "@/lib/fields";
import { DEMO_MODE } from "@/lib/demo/mode";
import { demo } from "@/lib/demo/store";
import { waitlistFromForm, waitlistSchema } from "@/lib/validation/waitlist";

type Props = {
  defaultRole?: "mentee" | "mentor";
  defaultField?: FieldSlug;
  id?: string;
};

const initial: WaitlistState = { status: "idle" };

// 대기자 등록 폼 (홈·아카데미·분야 페이지 공용)
export function WaitlistForm({ defaultRole = "mentee", defaultField, id = "waitlist-form" }: Props) {
  const [serverState, action, pending] = useActionState(joinWaitlist, initial);
  // 시연용 데모에서는 서버 대신 이 브라우저의 데모 저장소에 넣는다
  const [demoState, setDemoState] = useState<WaitlistState | null>(null);
  const state = demoState ?? serverState;

  // action prop을 쓰면 React가 제출 후 입력값을 비운다. 오류 시 입력이 남도록 직접 보낸다.
  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    if (DEMO_MODE) {
      setDemoState(submitDemo(fd));
      return;
    }
    startTransition(() => action(fd));
  }
  const err = state.status === "error" ? state.fieldErrors ?? {} : {};

  if (state.status === "ok") {
    return (
      <div role="status" className="rounded-xl border border-accent/30 bg-accent-soft p-5">
        <p className="font-bold text-ink">대기자 등록 완료</p>
        <p className="mt-1 text-[15px] text-ink">{state.message}</p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} id={id} className="space-y-4" noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor={`${id}-name`} className="label">이름</label>
          <input id={`${id}-name`} name="name" className="input" autoComplete="name" maxLength={40} required />
          {err.name && <p className="mt-1 text-[13px] text-danger">{err.name}</p>}
        </div>
        <div>
          <label htmlFor={`${id}-email`} className="label">이메일</label>
          <input id={`${id}-email`} name="email" type="email" inputMode="email" className="input" autoComplete="email" required />
          {err.email && <p className="mt-1 text-[13px] text-danger">{err.email}</p>}
        </div>
      </div>

      <fieldset>
        <legend className="label">관심</legend>
        <div className="grid gap-2 sm:grid-cols-2">
          {[
            { v: "mentee", t: "멘티로 배우고 싶다" },
            { v: "mentor", t: "멘토로 나누고 싶다" },
          ].map((o) => (
            <label key={o.v} className="flex min-h-11 cursor-pointer items-center gap-2 rounded-lg border border-line px-3 has-[:checked]:border-accent has-[:checked]:bg-accent-soft">
              <input type="radio" name="roleInterest" value={o.v} defaultChecked={o.v === defaultRole} className="accent-accent" />
              <span className="text-[15px]">{o.t}</span>
            </label>
          ))}
        </div>
        {err.roleInterest && <p className="mt-1 text-[13px] text-danger">{err.roleInterest}</p>}
      </fieldset>

      <div>
        <label htmlFor={`${id}-field`} className="label">분야</label>
        <select id={`${id}-field`} name="fieldSlug" className="input" defaultValue={defaultField ?? ""} required>
          <option value="" disabled>분야를 골라 주세요</option>
          {FIELDS.map((f) => (
            <option key={f.slug} value={f.slug}>{f.no} {f.name}</option>
          ))}
        </select>
        {err.fieldSlug && <p className="mt-1 text-[13px] text-danger">{err.fieldSlug}</p>}
      </div>

      <div>
        <label htmlFor={`${id}-note`} className="label">한 줄 메모 <span className="font-normal text-sub">(선택)</span></label>
        <input id={`${id}-note`} name="note" className="input" maxLength={200} placeholder="예: 관광통역안내사 면접을 앞두고 있어요" />
        {err.note && <p className="mt-1 text-[13px] text-danger">{err.note}</p>}
      </div>

      <div>
        <label className="flex items-start gap-2 text-sm text-ink">
          <input type="checkbox" name="privacyConsent" className="mt-0.5 size-4 accent-accent" required />
          <span>
            [필수] 오픈 안내를 위해 이름·이메일·관심 분야를 수집·이용하는 데 동의합니다. 보유 기간은 서비스 정식 오픈 후 6개월 또는 삭제 요청 시까지입니다.{" "}
            <Link href="/legal/privacy" className="font-semibold text-navy underline underline-offset-2" target="_blank">전문 보기</Link>
          </span>
        </label>
        {err.privacyConsent && <p className="mt-1 text-[13px] text-danger">{err.privacyConsent}</p>}
      </div>

      {state.status === "error" && !Object.keys(err).length && (
        <p role="alert" className="text-sm text-danger">{state.message}</p>
      )}

      <button type="submit" className="btn-primary w-full sm:w-auto" disabled={pending}>
        {pending ? "등록하는 중…" : "대기자 등록하기"}
      </button>
    </form>
  );
}

function submitDemo(fd: FormData): WaitlistState {
  const parsed = waitlistSchema.safeParse(waitlistFromForm(fd));
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) fieldErrors[String(issue.path[0] ?? "form")] ??= issue.message;
    return { status: "error", message: "입력 내용을 확인해 주세요.", fieldErrors };
  }
  const v = parsed.data;
  const r = demo.addWaitlist({ name: v.name, email: v.email, roleInterest: v.roleInterest, field: v.fieldSlug, note: v.note });
  return {
    status: "ok",
    message:
      r === "duplicate"
        ? "이미 대기자로 등록된 이메일입니다. (시연: 운영자 화면의 대기자 목록에서 확인할 수 있습니다)"
        : "등록되었습니다. (시연: 운영 → 대기자 화면에 방금 등록한 내용이 집계됩니다)",
  };
}
