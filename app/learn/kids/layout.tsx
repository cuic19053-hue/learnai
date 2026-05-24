import XpProvider from "@/components/learn/kids/XpProvider";
import RewardOverlay from "@/components/learn/kids/RewardOverlay";

/**
 * Shared layout for /learn/kids/* — wraps everything in the XP
 * provider so the level bar in the header and the achievement
 * overlay observe the same state. The provider hydrates from
 * localStorage, so reloads keep the streak and badges.
 */
export default function KidsLayout({ children }: { children: React.ReactNode }) {
  return (
    <XpProvider>
      {children}
      <RewardOverlay />
    </XpProvider>
  );
}
