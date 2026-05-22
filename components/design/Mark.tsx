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
    <div className="la-mark" style={{ fontSize }}>
      <div className="badge" style={{ width: size, height: size }}>
        L
      </div>
      <span>
        Learn<span className="grad">AI</span>
      </span>
    </div>
  );
}
