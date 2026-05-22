import type { CSSProperties } from "react";

type ImgSlotProps = {
  label: string;
  height?: number;
  style?: CSSProperties;
};

/**
 * Striped placeholder for sections that will hold artwork later. The
 * design system intentionally avoids hand-drawn illustrations until
 * production assets exist.
 */
export default function ImgSlot({ label, height = 120, style }: ImgSlotProps) {
  return (
    <div className="la-imgslot" style={{ height, ...style }} role="img" aria-label={label}>
      <span>{label}</span>
    </div>
  );
}
