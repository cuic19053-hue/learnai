type PersonaAvatarProps = {
  emoji: string;
  /** CSS color value or var(...) for the accent ring. */
  color: string;
  /** CSS color value or var(...) for the soft fill. */
  bg: string;
  size?: number;
  ariaLabel?: string;
};

/**
 * Gradient bubble avatar — the design system uses these instead of
 * hand-drawn character art. Renders an emoji glyph over a soft radial
 * gradient tinted by the journey color.
 */
export default function PersonaAvatar({
  emoji,
  color,
  bg,
  size = 64,
  ariaLabel,
}: PersonaAvatarProps) {
  return (
    <div
      className="la-avatar"
      role={ariaLabel ? "img" : undefined}
      aria-label={ariaLabel}
      aria-hidden={ariaLabel ? undefined : true}
      style={{
        width: size,
        height: size,
        background: `radial-gradient(circle at 30% 30%, #fff, ${bg} 60%, ${color} 130%)`,
        boxShadow: `inset 0 0 0 2px ${color}33, 0 8px 20px ${color}22`,
        fontSize: size * 0.42,
      }}
    >
      <span aria-hidden>{emoji}</span>
    </div>
  );
}
