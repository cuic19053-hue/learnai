# Certifications question bank — attribution

The JSON files in `certifications/questions/` are imported from
[ruslanmv/AWS-Exam-Simulator](https://github.com/ruslanmv/AWS-Exam-Simulator),
released by the same author as this project under the **Apache License
2.0**.

> Copyright (c) Ruslan Magana Vsevolodovna · Apache License 2.0
>
> See the upstream LICENSE at
> <https://github.com/ruslanmv/AWS-Exam-Simulator/blob/master/LICENSE>
> for the full terms.

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
