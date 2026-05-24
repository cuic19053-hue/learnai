# Certifications question bank — attribution

The JSON files in `certifications/questions/` are original study material
written for this project. They were inspired by publicly available exam
objectives, vendor documentation, and topics discussed across the
internet, but each question (prompt, options, and explanation) was
authored from scratch for use here.

> Copyright (c) the LearnAI contributors · released under the same
> licence as the rest of this repository.

## Format

Each file is an array of question objects:

```jsonc
{
  "question": "string — the prompt",
  "options": ["A. …", "B. …", "C. …", "D. …"],
  "correct": "A. …"          // exact match of one option (single-answer)
                              // OR "" when the answer is multi-select and
                              // lives inside the explanation block
  "explanation": "string — long-form rationale",
  "references": "string — optional"
}
```

## What we expose to learners

The LearnAI Certifications wizard (`/learn/certifications`) consumes
these files server-side via `lib/certifications/load.ts`. Learners see
one question at a time, can self-rate, get the explanation and the
correct answer, and move on. We never expose the full JSON file to
the browser.
