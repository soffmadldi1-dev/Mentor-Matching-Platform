import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getViewer } from "@/lib/auth";
import { safeNext } from "@/lib/safeNext";
import { isSupabaseConfigured, SUPABASE_NOT_CONFIGURED_MESSAGE } from "@/lib/supabase/env";
import { LoginForm } from "./LoginForm";
import { DEMO_MODE } from "@/lib/demo/mode";
import { OpenAs } from "@/components/demo/OpenAs";

export const metadata: Metadata = { title: "로그인" };

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const sp = await searchParams;
  const next = safeNext(sp.next);
  if (DEMO_MODE) {
    return (
      <div className="mx-auto max-w-md px-4 py-12">
        <h1 className="text-2xl font-extrabold tracking-tight">시연용 데모입니다</h1>
        <p className="mt-2 text-[15px] text-sub">정식 서비스에서는 이메일로 받은 링크를 눌러 로그인합니다. 시연에서는 역할을 골라 바로 들어가 보세요.</p>
        <div className="mt-6 grid gap-2">
          <OpenAs role="mentee" href="/me/notes" label="멘티로 들어가기" className="btn-outline" />
          <OpenAs role="candidate" href="/academy/camp" label="예비 멘토로 들어가기" className="btn-outline" />
          <OpenAs role="mentor" href="/studio" label="인증 멘토로 들어가기" className="btn-outline" />
          <OpenAs role="admin" href="/admin" label="운영자로 들어가기" className="btn-outline" />
        </div>
      </div>
    );
  }
  const viewer = await getViewer();
  if (viewer) redirect(next);

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <h1 className="text-2xl font-extrabold tracking-tight">로그인 · 회원가입</h1>
      <p className="mt-2 text-[15px] text-sub">
        비밀번호 없이 이메일로 받은 링크를 눌러 로그인합니다. 처음이면 자동으로 가입됩니다.
      </p>
      {sp.error === "link" && (
        <p role="alert" className="mt-4 rounded-lg bg-accent-soft p-3 text-sm text-danger">
          로그인 링크가 만료되었거나 이미 사용되었습니다. 새 링크를 받아 주세요.
        </p>
      )}
      {!isSupabaseConfigured() && (
        <p role="alert" className="mt-4 rounded-lg bg-panel p-3 text-sm text-danger">{SUPABASE_NOT_CONFIGURED_MESSAGE}</p>
      )}
      <div className="card mt-6 p-5">
        <LoginForm next={next} />
      </div>
    </div>
  );
}
