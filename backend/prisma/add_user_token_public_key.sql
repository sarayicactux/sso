ALTER TABLE "user_tokens" ADD COLUMN IF NOT EXISTS "publicKey" TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS "user_tokens_publicKey_key" ON "user_tokens"("publicKey");
