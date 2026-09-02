import Link from "next/link";
import PersonaAvatar from "@/components/design/PersonaAvatar";
import { Arrow } from "@/components/design/icons";
import type { Journey } from "@/lib/learn/journeys";

/**
 * Journey card from the design system. Whole card is the click target.
 * Visual rules: persona avatar, age pill, title, one-line description,
 * example slot, "Start this journey" arrow tinted by the journey color.
 */
export default function LearningStageCard({
  emoji,
  name,
  age,
  desc,
  example,
  color,
  bg,
  href,
}: Pick<Journey, "emoji" | "name" | "age" | "desc" | "example" | "color" | "bg" | "href">) {
  return (
    <Link href={href} className="la-jcard" aria-label={`开启 ${name} 学习旅程, ${age}`}>
      <div className="flex items-start justify-between">
        <PersonaAvatar emoji={emoji} color={color} bg={bg} size={48} />
        <span className="la-pill" style={{ background: bg, color }}>
          {age}
        </span>
      </div>
      <div>
        <h3>{name}</h3>
        <p style={{ marginTop: 6 }}>{desc}</p>
      </div>
      <div className="ex">
        <b>课程示例</b>
        {example}
      </div>
      <div className="start" style={{ color }}>
        开启学习旅程
        <span className="arr" style={{ background: color }}>
          <Arrow size={14} color="#fff" />
        </span>
      </div>
    </Link>
  );
}
