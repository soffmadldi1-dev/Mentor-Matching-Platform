import { FIELDS } from "@/lib/fields";

export type WaitlistRow = {
  id: string;
  email: string;
  name: string;
  role_interest: "mentee" | "mentor";
  field_slug: string | null;
  note: string | null;
  created_at: string;
};

/** 분야 × 관심(멘티/멘토) 집계 */
export function aggregateWaitlist(rows: Pick<WaitlistRow, "role_interest" | "field_slug">[]) {
  const byField = FIELDS.map((f) => ({ slug: f.slug, name: f.name, mentee: 0, mentor: 0, total: 0 }));
  const other = { slug: "none", name: "분야 미선택", mentee: 0, mentor: 0, total: 0 };
  for (const r of rows) {
    const bucket = byField.find((b) => b.slug === r.field_slug) ?? other;
    bucket[r.role_interest] += 1;
    bucket.total += 1;
  }
  const list = other.total ? [...byField, other] : byField;
  const totals = list.reduce(
    (acc, b) => ({ mentee: acc.mentee + b.mentee, mentor: acc.mentor + b.mentor, total: acc.total + b.total }),
    { mentee: 0, mentor: 0, total: 0 },
  );
  return { rows: list, totals };
}
