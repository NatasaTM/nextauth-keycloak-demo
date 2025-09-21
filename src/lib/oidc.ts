import crypto from "crypto";

export function randomString(len = 64) {
  return crypto.randomBytes(len).toString("base64url");
}

export function pkceChallengeFromVerifier(verifier: string) {
  const hash = crypto.createHash("sha256").update(verifier).digest();
  return Buffer.from(hash).toString("base64url");
}

export function kcUrls() {
  const base = process.env.KC_BASE_URL!;
  const realm = process.env.KC_REALM!;
  return {
    authorize: `${base}/realms/${realm}/protocol/openid-connect/auth`,
    token: `${base}/realms/${realm}/protocol/openid-connect/token`,
    logout: `${base}/realms/${realm}/protocol/openid-connect/logout`,
  };
}
