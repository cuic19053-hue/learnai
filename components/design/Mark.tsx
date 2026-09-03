type MarkProps = {
  size?: number;
  fontSize?: number;
};

/**
 * The LearnAI logomark — gradient "L" badge plus the "Learn AI" wordmark
 * with the AI portion gradient-filled. Matches the design handoff.
 */
export default function Mark({ size = 32, fontSize = 22 }: MarkProps) {
  return (
    <div
      className="la-mark"
      style={{ fontSize, display: "inline-flex", alignItems: "center", gap: 8 }}
    >
      <div className="badge" style={{ width: size, height: size }}>
        智
      </div>
      <span>
        AI<span className="grad">智能学习助手</span>
      </span>
    </div>
  );
}
