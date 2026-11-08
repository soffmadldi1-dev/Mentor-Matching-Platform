import type { Metadata } from "next";

export const metadata: Metadata = { title: "개인정보 수집·이용 동의(초안)" };

// 11장: 동의 문구 초안. 정식 오픈 전 전문가 검토가 필요하다.
const ITEMS = [
  {
    title: "대기자 등록",
    rows: [
      ["수집 항목", "이름, 이메일, 관심(멘티·멘토), 관심 분야, 한 줄 메모(선택)"],
      ["이용 목적", "서비스 오픈·파운딩 멘토 모집 안내, 분야별 수요 파악"],
      ["보유 기간", "서비스 정식 오픈 후 6개월 또는 삭제 요청 시까지"],
    ],
  },
  {
    title: "회원가입",
    rows: [
      ["수집 항목", "이메일, 표시 이름(선택), 연락처(선택)"],
      ["이용 목적", "본인 확인과 로그인, 신청·과정 운영 안내"],
      ["보유 기간", "회원 탈퇴 시까지(관계 법령에 따라 보관이 필요한 경우 해당 기간)"],
    ],
  },
  {
    title: "공략 요청서(고민) 저장",
    rows: [
      ["수집 항목", "현재 상황, 목표, 막힌 점, 필요한 결과물, 일정·예산 등 직접 입력한 내용"],
      ["이용 목적", "맞는 멘토·과정 추천(매칭)에만 사용하며 다른 목적으로 쓰지 않습니다"],
      ["열람 범위", "본인과 운영자만 열람합니다"],
      ["보유 기간", "삭제 요청 시 또는 회원 탈퇴 시까지"],
    ],
  },
];

export default function PrivacyPage() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-12">
      <p className="eyebrow">초안 · 정식 오픈 전 검토 예정</p>
      <h1 className="mt-2 text-3xl font-extrabold tracking-tight">개인정보 수집·이용 동의</h1>
      <p className="mt-3 text-[15px] leading-relaxed text-sub">
        먼저가본(운영: 홍요셉)은 아래 목적에 필요한 최소한의 정보만 받습니다. 동의하지 않으실 수 있으며, 동의하지 않으면 해당 기능(대기자 등록, 회원가입, 요청서 저장)을 이용할 수 없습니다.
      </p>

      {ITEMS.map((item) => (
        <section key={item.title} className="mt-8">
          <h2 className="text-lg font-bold text-navy">{item.title}</h2>
          <dl className="mt-3 divide-y divide-line rounded-xl border border-line">
            {item.rows.map(([k, v]) => (
              <div key={k} className="grid gap-1 p-4 sm:grid-cols-[120px_1fr] sm:gap-4">
                <dt className="text-sm font-bold text-sub">{k}</dt>
                <dd className="text-[15px] text-ink">{v}</dd>
              </div>
            ))}
          </dl>
        </section>
      ))}

      <section className="mt-8 space-y-3 text-[15px] leading-relaxed text-ink">
        <h2 className="text-lg font-bold text-navy">함께 알려 드립니다</h2>
        <p>멘티의 고민과 이력서는 매칭 외 목적으로 쓰지 않습니다. AI 도구를 쓰는 기능에서는 이름·연락처를 지운 뒤 내용을 넘기도록 설계했습니다.</p>
        <p>멘토와 멘티가 플랫폼 밖 연락처를 주고받도록 유도하는 문구는 제한될 수 있습니다.</p>
        <p>열람·정정·삭제를 원하시면 운영자에게 요청해 주세요. 확인 후 지체 없이 처리합니다.</p>
        <p className="text-sm text-sub">시행일: 정식 오픈 시 공지</p>
      </section>
    </article>
  );
}
