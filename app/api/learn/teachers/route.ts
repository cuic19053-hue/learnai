import { NextResponse } from "next/server";
import { TEACHERS, teachersForStage } from "@/lib/learn/teachers";
import type { LearnerStage } from "@/lib/learn/stages";

const VALID_STAGES: LearnerStage[] = [
  "GRADE_6",
  "GRADE_7",
  "GRADE_8",
  "GRADE_9",
  "UNIVERSITY",
  "PROFESSIONAL",
  "SENIOR",
];

export async function GET(req: Request) {
  const url = new URL(req.url);
  const stage = url.searchParams.get("stage");
  if (stage && (VALID_STAGES as string[]).includes(stage)) {
    return NextResponse.json({ teachers: teachersForStage(stage as LearnerStage) });
  }
  return NextResponse.json({ teachers: TEACHERS });
}
