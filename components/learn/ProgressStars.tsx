export default function ProgressStars({
  total = 5,
  earned = 3,
}: {
  total?: number;
  earned?: number;
}) {
  return (
    <div
      role="img"
      aria-label={`${earned} of ${total} stars earned`}
      className="flex gap-1"
    >
      {Array.from({ length: total }).map((_, i) => (
        <span key={i} aria-hidden className="text-2xl">
          {i < earned ? "⭐" : "☆"}
        </span>
      ))}
    </div>
  );
}
