CREATE TABLE IF NOT EXISTS "app_user" (
  "id" SERIAL PRIMARY KEY,
  "userId" INTEGER NOT NULL,
  "appId" INTEGER NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "deletedAt" TIMESTAMP(3),
  CONSTRAINT "app_user_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "users"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "app_user_appId_fkey"
    FOREIGN KEY ("appId") REFERENCES "apps"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "app_user_userId_appId_key"
  ON "app_user" ("userId", "appId");
