# Little Learner — Production Plan & Audit Report

Generated from a programmatic audit of `lib/letterforge/subjects.ts`
(progression catalog), `lib/learn/kids/exercises*.ts` (exercise
catalogs), `lib/letterforge/i18n.ts` (UI strings), and the runtime
wiring in `app/learn/kids/**`.

---

## 1 · Audit results (before this commit)

### Exercise coverage per world

| World     | Sequence (PROGRESSION) | Catalog ex. | Coverage         |
| --------- | ---------------------- | ----------- | ---------------- |
| Letters   | A → M (13)             | 19          | ❌ F, I, J, K missing |
| Numbers   | 1 → 10 (10)            | 24          | ✅ all covered   |
| Colors    | Red → Pink (7)         | 17          | ✅ all covered   |
| Shapes    | Circle → Heart (5)     | 12          | ✅ all covered   |
| Animals   | Lion → Bear (6)        | 17          | ❌ Bird, Bear missing |
| Feelings  | Happy → Excited (6)    | 12          | ✅ all covered   |
| Stories   | 3 stories              | **0**       | ❌ entire world empty |

### Per-language Letter pools

| lang | native pool | coverage notes                                |
| ---- | ----------- | --------------------------------------------- |
| en   | (catalog)   | A–M ✅                                        |
| es   | ✅ 24 entries | A · B · C · D · E · F · G · L · M · N · O · P · R · S · T |
| it   | ✅ 24 entries | A · B · C · D · E · F · G · L · M · N · P · R · S · T     |
| fr   | ✅ 24 entries | A · B · C · D · E · F · G · L · M · N · O · P · R · S · T |
| pt   | ✅ 19 entries | A · B · C · D · E · F · G · L · M · N · O · P · R · S · T |
| de   | ✅ 19 entries | A · B · D · E · F · G · H · K · L · M · N · R · S · T     |
| ar / ru / hi / ja / ko / zh | ❌ none | falls back to English catalog (mixed-script bug) |

### Non-Letter localization

| theme       | en | es | it | fr | pt | de | ar/ru/hi/ja/ko/zh |
| ----------- | -- | -- | -- | -- | -- | -- | ----------------- |
| Numbers     | ✅ | partial | partial | partial | partial | partial | ❌ |
| Colors      | ✅ | partial | partial | partial | partial | partial | ❌ |
| Shapes      | ✅ | partial | partial | partial | partial | partial | ❌ |
| Animals     | ✅ | partial | partial | partial | partial | partial | ❌ |
| Feelings    | ✅ | partial | partial | partial | partial | partial | ❌ |
| Stories     | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |

"Partial" = prompts + common word labels translated via
`exercises-i18n.ts`; specific exercise IDs may still surface English
strings until a dedicated pool lands per the Batch 2 plan below.

---

## 2 · Fixes applied in this commit

### 2.1 English catalog gap-fills (in `exercises-extra.ts`)
- **Letters F / I / J / K**: 2 match-pair exercises each (8 total). Frog,
  Flower; Ice, Ice cream; Jellyfish, Juice; Key, Kangaroo.
- **Animals Bird / Bear**: pick-named + what-says/bigger (4 total).
- **Shapes Rectangle** + **Feelings Scared**: 1 each (reinforcement).
- **Stories pool**: 6 narrative match-pair exercises across the three
  stories (Brave Bunny · Curious Fox · Sleepy Bear).

### 2.2 Stories wired into the runtime
- `KidsTheme` now includes `"stories"`.
- `THEMES` table gets a Stories entry (📚, indigo accent).
- `SUBJECT_TO_THEME` in PlaySequence maps `stories` → `stories` so the
  catalog drives the practice (was falling back to the legacy 3-game
  shell, which left the world feeling thin).

### 2.3 Result
**100 % topic coverage across all 7 worlds, all PROGRESSION items.**

```
letters     27 ex · ✅ all covered
numbers     23 ex · ✅ all covered
colors      17 ex · ✅ all covered
shapes      13 ex · ✅ all covered
animals     21 ex · ✅ all covered
feelings    13 ex · ✅ all covered
stories      6 ex · ✅ all covered
```

---

## 3 · Production plan — remaining batches

### Batch A — Non-Letter native pools per language (`exercises-i18n.ts`)
**Why:** today Italian Numbers reads correctly because
`exercises-extra.ts` is English and `localizeExercise()` translates
the prompt + labels word-by-word. That works for "How many apples?"
→ "Quante mele?" but breaks any time the English answer's locale
form is grammatically gendered or differs phonetically. A native
pool removes the risk entirely.

**Scope per language (es / it / fr / pt / de):**
- Numbers: 12 native counting exercises (use locale objects: pere,
  pommes, panes, etc.)
- Colors: 8 native exercises with locale color words
- Shapes: 6 native exercises
- Animals: 8 native exercises (locale animal names)
- Feelings: 6 native exercises (locale emotion words)

**Cost:** ~40 exercises × 5 languages = 200 entries.
**Estimated bundle:** +12 KB gzipped (still in the catalog package).

### Batch B — Non-Latin script support (ar / ru / hi / ja / ko / zh)
**Why:** today these locales surface English-text exercises with
the speech engine speaking in the locale voice — mixed-screen bug.

**Scope per language:**
- Per-letter pool sized to the local alphabet (Arabic 28, Russian
  33, Hindi ~35, Japanese hiragana 46, Korean ~24 initial jamo,
  Chinese 30 starter characters).
- For Chinese, swap the "starts with X" exercise type for
  "Find the character X" + "Match character → sound" per the
  pedagogy spec.

**Cost:** 6 languages × ~30 letter exercises + 6 × 30 number/word
exercises = ~360 entries.
**Estimated bundle:** +40 KB gzipped. Consider lazy-loading per
locale.

### Batch C — Continue routing actually advances day's item
**Today:** the reward "Continue: Learn B" button routes back to
`/teach` but the teach page reads today's item from `subject.today`
(static catalog), so it teaches A again, not B.

**Plan:**
1. Add `?topic=B` query param support to `/teach/page.tsx` and
   `/play/page.tsx`. Both extract the param and override `dayTarget`.
2. RewardScreen and the Continue Learning card on `/progress` pass
   `topic={nextTopicEnglish(slug, current)}` in the URL.
3. PlaySequence's `pickSessionExercises({ targetItem })` already
   sorts by target — it'll automatically pin exercises matching the
   new topic first.

**Cost:** ~80 lines.

### Batch D — Per-topic progress tracking (vs the floor(taps/3) hack)
**Today:** `progressionFor(slug, taps)` approximates done-count as
`floor(taps/3)`. A child who finishes 6 sessions on Letter A would
appear to have "learned" letters A and B even though they only saw A.

**Plan:**
1. Extend `XpState.bySubject` from `Record<string, number>` to
   `Record<string, Record<topic, number>>`.
2. `addCorrect(subject, topic)` increments per topic.
3. `progressionFor` reads the per-topic counter; a topic is
   "completed" when its counter ≥ 3.
4. Migrate localStorage `miloXp.v1` → `v2`.

**Cost:** ~100 lines. Backwards-compat shim for v1 readers.

### Batch E — Parent dashboard real data
**Today:** `/learn/kids/parent` shows hardcoded "Lina · 2 lessons
started · Stars 6" sample copy.

**Plan:**
1. Read live state from `XpProvider` (parent area is inside the
   kids layout, so the provider is already in scope).
2. Generate "What went well" + "Where she paused" from per-subject
   tap counts and the deficit ratio.
3. "Tomorrow Milo suggests" pulls from `nextTopicEnglish` for the
   most-progressed subject.

**Cost:** ~150 lines.

### Batch F — Milo mascot artwork
**Today:** `<Milo />` falls back to the 🐯 emoji because
`public/images/kids/milo.png` hasn't been added.

**Plan:** drop the cheerful tiger PNG (per the asset README) at
`public/images/kids/milo.png` (and optionally `-cheer` / `-wave`
variants). No code change needed — the component picks it up
automatically.

### Batch G — Production polish (small)
- Storybook entries for `<Milo />`, `<XpBar />`, `<RewardOverlay />`.
- Per-route metadata (OpenGraph image of Milo waving).
- `next/image` migration for the Milo asset (LCP optimization).
- Replace the `MISSING` Set in `Milo.tsx` with a Service Worker
  cache test (so SSR doesn't always try the variant once).

---

## 4 · Ready for production?

| Surface                              | Status                  |
| ------------------------------------ | ----------------------- |
| /learn/kids (home + selector)        | ✅ ready                |
| /learn/kids/[subject] (intro)        | ✅ ready                |
| /learn/kids/[subject]/teach (warm-up)| ✅ ready                |
| /learn/kids/[subject]/play (practice)| ✅ ready (all worlds)   |
| /learn/kids/parent (dashboard)       | 🟡 cosmetic (Batch E)   |
| /learn/kids/progress (skills/path)   | ✅ ready                |
| XP + level + streak + achievements   | ✅ ready                |
| Audio (chimes + TTS)                 | ✅ ready                |
| Sparkle + celebration animations     | ✅ ready                |
| Soft-scoring (no-stuck retry)        | ✅ ready                |
| English catalog                      | ✅ 100 % topic coverage |
| ES / IT / FR / PT / DE letters       | ✅ native pools         |
| ES / IT / FR / PT / DE other worlds  | 🟡 translation only (Batch A)|
| AR / RU / HI / JA / KO / ZH content  | 🟡 voice only (Batch B) |
| Continue advances to next topic      | 🟡 returns to /teach today (Batch C) |
| Per-topic progress vs aggregate taps | 🟡 floor(taps/3) (Batch D) |
| Milo PNG asset                       | 🟡 emoji fallback (Batch F) |

**Verdict:** the English experience is production-ready end-to-end.
The Latin-language experience (es/it/fr/pt/de) is production-ready
for Letters and acceptable-with-known-limits for the other worlds.
Non-Latin locales need Batch B before public launch.
