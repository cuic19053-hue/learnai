-- Adds the tokenVersion counter to User. Powers "Sign out everywhere":
-- the JWT callback rejects tokens whose embedded version is older than
-- the row's current value, forcing re-authentication on every device.

ALTER TABLE "User"
  ADD COLUMN "tokenVersion" INTEGER NOT NULL DEFAULT 0;
