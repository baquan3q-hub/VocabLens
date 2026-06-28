import { proficiencyFromScore } from "@vocablens/shared";

const labels = { new: "Mới học", learning: "Đang tiến bộ", familiar: "Quen thuộc", mastered: "Thành thạo" };

export function ProficiencyBadge({ score }: { score: number }) {
  const level = proficiencyFromScore(score);
  return <span className={`badge badge-${level}`}>{labels[level]}</span>;
}
