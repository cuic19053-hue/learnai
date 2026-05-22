-- Per-user learning data: replaces process-local in-memory stores with
-- proper DB rows scoped by userId. Cascades on user delete.

-- Project: wizard drafts, currently lost on lambda cold start
CREATE TABLE "Project" (
    "id"            TEXT NOT NULL,
    "userId"        TEXT NOT NULL,
    "worldSlug"     TEXT NOT NULL,
    "topic"         TEXT NOT NULL,
    "outcome"       TEXT NOT NULL DEFAULT '',
    "sources"       TEXT[],
    "daysPerWeek"   INTEGER NOT NULL,
    "minutesPerDay" INTEGER NOT NULL,
    "deadline"      TEXT,
    "prefs"         TEXT[],
    "status"        TEXT NOT NULL DEFAULT 'idea',
    "createdAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"     TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Project_userId_worldSlug_idx"  ON "Project"("userId", "worldSlug");
CREATE INDEX "Project_userId_createdAt_idx"  ON "Project"("userId", "createdAt");

ALTER TABLE "Project"
    ADD CONSTRAINT "Project_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

-- UserPreferences: tutor + TTS settings, currently localStorage only
CREATE TABLE "UserPreferences" (
    "userId"     TEXT NOT NULL,
    "teacherId"  TEXT DEFAULT 'nova',
    "ttsEngine"  TEXT DEFAULT 'web-speech',
    "voiceLabel" TEXT,
    "extra"      JSONB NOT NULL DEFAULT '{}'::jsonb,
    "updatedAt"  TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserPreferences_pkey" PRIMARY KEY ("userId")
);

ALTER TABLE "UserPreferences"
    ADD CONSTRAINT "UserPreferences_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

-- UserProgress: XP, streak, per-world stats — currently cookie + localStorage
CREATE TABLE "UserProgress" (
    "userId"     TEXT NOT NULL,
    "xp"         INTEGER NOT NULL DEFAULT 0,
    "streak"     INTEGER NOT NULL DEFAULT 0,
    "lastSeen"   TIMESTAMP(3),
    "worldStats" JSONB NOT NULL DEFAULT '{}'::jsonb,
    "updatedAt"  TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserProgress_pkey" PRIMARY KEY ("userId")
);

ALTER TABLE "UserProgress"
    ADD CONSTRAINT "UserProgress_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
