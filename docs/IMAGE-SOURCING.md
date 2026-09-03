# Image sourcing — vetted, commercial-OK shopping list

> Complements the in-house SVG illustrations under `components/illustrations/`.
> Use these when you want a richer, photographic feel on the homepage hero
> and Worlds cards.

All sources listed below permit **commercial use without attribution**:

| Source | License page | Attribution required? |
|---|---|---|
| [Unsplash](https://unsplash.com/license) | unsplash.com/license | No (welcomed) |
| [Pexels](https://www.pexels.com/license/) | pexels.com/license | No (welcomed) |
| [Pixabay](https://pixabay.com/service/license-summary/) | pixabay.com/service/license-summary | No |
| Wikimedia Commons (CC0 / PD only) | commons.wikimedia.org | Filter for PD or CC0 |

Always re-verify the license at download time — Unsplash sometimes flips
photos to a restricted "Unsplash+" tier.

---

## How to add a photo to the app (3 steps)

1. **Download** the photo from one of the sources below. Pick the largest
   available size.
2. **Process** it locally with Sharp into AVIF + WebP at 1920 / 1280 / 640
   widths (script lands in PR 2 of Track B). Output goes under
   `public/img/<surface>/<slug>.{avif,webp}`.
3. **Register** it in `lib/img/manifest.ts` with id, description, license,
   author, source URL — the `/licenses` page picks it up automatically.

Until the Sharp pipeline lands, you can drop straight JPEG/PNG files under
`public/img/` and reference them via `next/image` with a `priority` flag
for the hero only.

---

## Homepage hero — photographic option

Pick **one** of these as a full-bleed hero behind the gradient overlay.
Crop target: **1920×900**.

| Photo | Source | License | Author |
|---|---|---|---|
| Diverse hands on a laptop, soft natural light | [Unsplash search · "collaborative learning"](https://unsplash.com/s/photos/collaborative-learning) | Unsplash | search |
| Aerial of a city at golden hour (Career world feel) | [Unsplash search · "city sunset overhead"](https://unsplash.com/s/photos/city-sunset-overhead) | Unsplash | search |
| Light teal and pink abstract gradient backdrop | [Pexels search · "soft gradient pastel"](https://www.pexels.com/search/soft%20gradient%20pastel/) | Pexels | search |

Suggested photographer pages on Unsplash known for permissive, brand-neutral
education imagery:
- [@christinawocintechchat](https://unsplash.com/@wocintechchat) — diverse tech professionals
- [@etiennegirardet](https://unsplash.com/@etiennegirardet) — abstract gradients
- [@annspratt](https://unsplash.com/@anniespratt) — kids playing, learning
- [@andrewtneel](https://unsplash.com/@andrewtneel) — flat lay desks

---

## Worlds cards — 4 photographic covers

Use these as 320×140 crops *behind* the SVG illustration, OR replace the
SVG entirely. Suggested searches:

| World | Visual brief | Where to look |
|---|---|---|
| 🦁 **Playful** (Little Learner) | Crayons, watercolour splash, soft daylight, *no faces* (model-release safe) | [Pexels · "crayons children flat lay"](https://www.pexels.com/search/crayons%20flat%20lay/) · [Pixabay · "watercolor pastel"](https://pixabay.com/images/search/watercolor%20pastel/) |
| 🚀 **Mission** (GRADE_8) | Mechanical keyboard, neon-violet glow, small electronics | [Unsplash · "neon keyboard purple"](https://unsplash.com/s/photos/neon-keyboard-purple) · [Pexels · "electronics gradient"](https://www.pexels.com/search/electronics%20gradient/) |
| 💼 **Career** (Professional) | Modern office, abstract glass, no recognisable logos | [Unsplash · "abstract office glass"](https://unsplash.com/s/photos/abstract-office-glass) · [Pexels · "minimal workspace"](https://www.pexels.com/search/minimal%20workspace/) |
| 🌿 **Calm** (Senior) | Soft botanical, morning light, herbs, leaves | [Unsplash · "calm botanical morning"](https://unsplash.com/s/photos/calm-botanical-morning) · [Pexels · "soft green leaves"](https://www.pexels.com/search/soft%20green%20leaves/) |

**Rule of thumb:** prefer photos with **no faces** for the Worlds cards.
Model releases for stock photos are best-effort and you avoid the question
entirely by picking object / scene shots.

---

## Achievement icons — use an icon library, not photos

Icons are not where photographic stock excels. Two excellent open-source
sets cover everything an achievement system needs at SVG quality:

| Library | License | Style | Best for |
|---|---|---|---|
| [**Lucide**](https://lucide.dev) | ISC | Line, geometric | UI controls, soft badges (`trophy`, `star`, `medal`, `award`) |
| [**Phosphor Icons**](https://phosphoricons.com) | MIT | Six weights | Filled gold-style trophies (`trophy`, `medal`, `crown`, `confetti`, `lightning`) |
| [**Tabler Icons**](https://tabler.io/icons) | MIT | Line | 5,500+ icons, consistent grid |
| [**Twemoji**](https://github.com/twitter/twemoji) | CC-BY 4.0 | Coloured emoji-style | Trophy 🏆, sparkle ✨, fire 🔥 as SVG |

**Recommended:** install `lucide-react` and use its `<Trophy />`,
`<Star />`, `<Medal />`, `<Award />`, `<Flame />` for streak badges.
Already aligns with our line-icon aesthetic.

```tsx
import { Trophy, Flame, Medal } from "lucide-react";

// XP badge
<Trophy size={20} className="text-amber-500" />
```

Avoid bundling Twemoji as PNGs — the native browser emoji we already use is
indistinguishable on most platforms and adds zero KB.

---

## Teacher persona avatars — three options, ranked

Real photos for AI personas are **a bad idea** — even Unsplash photos have
optional model releases, and putting a real human face on an "AI teacher
called Nova" reads as deceptive.

Better options, ranked:

### 1. (Current) Emoji bubble avatars  ✅ what we ship today

`components/design/PersonaAvatar.tsx` already renders gradient bubbles with
emoji glyphs. Free, instant, stage-coloured, accessible. Keep as default.

### 2. DiceBear — procedural illustrated avatars

If you want more variety per teacher, [DiceBear](https://www.dicebear.com)
is the standard. Self-hostable, deterministic from a seed.

```bash
npm install @dicebear/core @dicebear/collection
```

```tsx
import { createAvatar } from "@dicebear/core";
import { adventurer, lorelei, openPeeps, thumbs } from "@dicebear/collection";

const svg = createAvatar(lorelei, { seed: "Nova" }).toString();
```

License: MIT (the library) + per-style attribution shown at
[dicebear.com/licenses](https://www.dicebear.com/licenses). Most styles are
CC-BY-4.0 or CC0 — pick CC0 styles (`thumbs`, `adventurer-neutral`,
`bottts-neutral`) to skip attribution.

### 3. Open Peeps — hand-drawn CC0 character library

[openpeeps.com](https://www.openpeeps.com/) — Pablo Stanley's CC0
character library. Mix-and-match SVG pieces. Best for richer illustrated
characters than DiceBear, at the cost of being non-procedural.

---

## What we're shipping today vs what's open for you to add

✅ **Already shipped** (Track A, commit `cbecf96`):
- 4 in-house SVG Worlds covers (Playful, Mission, Career, Calm)
- 1 in-house SVG hero volcano cross-section
- 1 EmptyState fallback SVG
- `lib/img/manifest.ts` — typed asset manifest
- `/licenses` — auto-generated attribution page
- `<Illustration id="…">` adapter

🟡 **Recommended adds** (you action, manifest update auto-renders):
- Photographic hero backdrop (Unsplash search above) — pick one
- Photographic Worlds backgrounds (4 from the searches above) — optional
- `lucide-react` for trophy / medal / star icons in the achievements UI

🟢 **Don't add**:
- Real-face photos for AI teacher personas (use emoji bubbles or DiceBear)
- External-CDN-hosted images (commit static, deploy atomic)
- Anything without a verifiable licence URL in the manifest

---

## When you download — fill these into the manifest

Template for `lib/img/manifest.ts`:

```ts
{
  id: "worlds/playful-photo",                          // matches Illustration id
  src: "/img/worlds/playful-watercolor.avif",          // public/ path
  description: "Watercolour splash on cream — Worlds card backdrop",
  license: "Unsplash",                                 // verbatim slug
  source: "https://unsplash.com/photos/<photo-id>",    // canonical URL
  author: "Photographer Name",
},
```

Once the entry is in the manifest and the file is under `public/img/`,
add a renderer case in `components/design/Illustration.tsx`:

```ts
const RENDERERS: Record<string, ComponentType<…>> = {
  // …existing…
  "worlds/playful-photo": (props) => (
    <Image
      src="/img/worlds/playful-watercolor.avif"
      alt={props.title ?? ""}
      fill
      sizes="(min-width: 1024px) 320px, 100vw"
      className={`object-cover ${props.className ?? ""}`}
    />
  ),
};
```

Now the `/licenses` page lists your new photo, and any
`<Illustration id="worlds/playful-photo" />` swap-in works.
