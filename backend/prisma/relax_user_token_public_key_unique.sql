-- publicKey is disposable (cleared to ''); allow multiple empty values.
-- Live non-empty keys stay unique via a partial index.
DROP INDEX IF EXISTS "user_tokens_publicKey_key";
CREATE UNIQUE INDEX IF NOT EXISTS "user_tokens_publicKey_key"
  ON "user_tokens" ("publicKey")
  WHERE "publicKey" IS NOT NULL AND "publicKey" <> '';
