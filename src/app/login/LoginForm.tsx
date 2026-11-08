"use client";

import { startTransition, useActionState, type FormEvent } from "react";
import Link from "next/link";
import { sendMagicLink, type LoginState } from "./actions";

const initial: LoginState = { status: "idle" };

export function LoginForm({ next }: { next: string }) {
  const [state, action, pending] = useActionState(sendMagicLink, initial);

  // action prop을 쓰면 React가 제출 후 입력값을 비운다. 오류 시 입력이 남도록 직접 보낸다.
  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(() => action(fd));
  }

  if (state.status === "sent") {
    return (
      <div role="status" className="rounded-xl border border-accent/30 bg-accent-soft p-5">
        <p className="font-bold">메일함을 확인해 주세요</p>
        <p className="mt-1 text-[15px]">
          <b>{state.email}</b>로 로그인 링크를 보냈습니다. 링크를 누르면 바로 로그인됩니다. 메일이 보이지 않으면 스팸함도 확인해 주세요.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <input type="hidden" name="next" value={next} />
      <div>
        <label htmlFor="login-email" className="label">이메일</label>
        <input id="login-email" name="email" type="email" inputMode="email" autoComplete="email" className="input" required />
      </div>
      <div>
        <label htmlFor="login-name" className="label">표시 이름 <span className="font-normal text-sub">(처음 가입 시, 선택)</span></label>
        <input id="login-name" name="displayName" className="input" maxLength={30} autoComplete="nickname" />
      </div>
      <label className="flex items-start gap-2 text-sm">
        <input type="checkbox" name="privacyConsent" className="mt-0.5 size-4 accent-accent" required />
        <span>
          [필수] 회원가입·로그인을 위한 개인정보 수집·이용에 동의합니다.{" "}
          <Link href="/legal/privacy" target="_blank" className="font-semibold text-navy underline underline-offset-2">전문 보기</Link>
        </span>
      </label>
      <label className="flex items-start gap-2 text-sm">
        <input type="checkbox" name="marketingConsent" className="mt-0.5 size-4 accent-accent" />
        <span>[선택] 새 공략 과정·캠프 소식을 이메일로 받겠습니다.</span>
      </label>
      {state.status === "error" && <p role="alert" className="text-sm text-danger">{state.message}</p>}
      <button type="submit" className="btn-primary w-full" disabled={pending}>
        {pending ? "보내는 중…" : "로그인 링크 받기"}
      </button>
    </form>
  );
}
