# Certifications — how to add a new exam pack

The certifications hub is **plug-and-play**. To add a new exam, drop one
JSON file (and optionally a metadata sidecar) into this folder. No
TypeScript edits required.

## Two-file pattern

```
certifications/questions/
├── MY-EXAM-v1.json          ← required: the questions
└── MY-EXAM-v1.meta.json     ← optional: display metadata
```

### 1. Questions file — `<slug>.json`

An array of question objects in this exact shape:

```jsonc
[
  {
    "question": "string — the prompt the learner sees",
    "options": [
      "A. first choice",
      "B. second choice",
      "C. third choice",
      "D. fourth choice"
    ],
    "correct": "B. second choice",
    "explanation": "string — long-form rationale shown after the answer is revealed",
    "references": "https://docs.example.com/optional"
  }
]
```

Notes:

- The slug (filename without `.json`) becomes the URL: `/learn/certifications/<slug>`.
- Slugs must match `^[A-Za-z0-9._-]+$` — no spaces, no slashes.
- The `correct` field should match one of `options` exactly, OR be an empty
  string for multi-select questions (the explanation describes the answer).
- `references` is optional.

### 2. Metadata sidecar — `<slug>.meta.json` (optional)

```jsonc
{
  "code": "MY-EXAM",
  "title": "My Example Cloud Architect Exam",
  "vendor": "AWS",
  "blurb": "One-sentence description shown on the hub card.",
  "level": "Associate"
}
```

Every field is optional. Defaults come from `inferCertificationMeta(slug)`
in `lib/certifications/catalog.ts`:

| Field | Default |
|---|---|
| `code` | The slug with `-vN` and `-mixed` suffixes stripped |
| `title` | Equal to the inferred `code` |
| `vendor` | Inferred from the slug prefix (CLF/SAA/SAP/DOP → AWS, AI/DP/AZ → Azure, GCP → GCP, C\d{4} → IBM, else Other) |
| `blurb` | "Practice questions imported via JSON." |
| `level` | Heuristic from suffix — defaults to "Associate" |

### Valid values

- `vendor`: `"AWS" \| "Azure" \| "GCP" \| "IBM" \| "Other"`
- `level`: `"Fundamentals" \| "Associate" \| "Professional" \| "Specialty"`

## How discovery works

On every request the hub calls `discoverCertifications()` in
`lib/certifications/load.ts`. That function:

1. Reads every `*.json` in this folder (excluding `*.meta.json`).
2. For each `<slug>.json`, looks for a sibling `<slug>.meta.json`.
3. Merges the sidecar over the inferred defaults.
4. Returns the full catalog, sorted by vendor → level → code.

Cached for the lifetime of the function instance.

## Removing a pack

Delete `<slug>.json` (and the sidecar if present). It disappears from
the UI on the next deploy. No catalog edit needed.

## Sort order

Packs are grouped under their vendor header in the hub:

1. AWS
2. Azure
3. GCP
4. IBM
5. Other

Within a vendor, packs are sorted by level (Fundamentals → Associate
→ Professional → Specialty) then by code.

## Source

The packs currently shipped come from
[ruslanmv/AWS-Exam-Simulator](https://github.com/ruslanmv/AWS-Exam-Simulator)
under the Apache 2.0 licence — see `NOTICE.md` in this folder.
