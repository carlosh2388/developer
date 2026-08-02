const crypto = require("crypto");

function encryptionKey() {
  const secret = process.env.LICENSE_STORAGE_SECRET;
  if (!secret || secret.length < 32) throw new Error("LICENSE_STORAGE_SECRET debe tener al menos 32 caracteres.");
  return crypto.createHash("sha256").update(secret).digest();
}

function encryptLicenseKey(value) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", encryptionKey(), iv);
  const encrypted = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  return { encryptedKey: encrypted.toString("base64"), encryptionIv: iv.toString("base64"), authTag: cipher.getAuthTag().toString("base64") };
}

function decryptLicenseKey(record) {
  const decipher = crypto.createDecipheriv("aes-256-gcm", encryptionKey(), Buffer.from(record.encryption_iv, "base64"));
  decipher.setAuthTag(Buffer.from(record.auth_tag, "base64"));
  return Buffer.concat([decipher.update(Buffer.from(record.encrypted_key, "base64")), decipher.final()]).toString("utf8");
}

module.exports = { encryptLicenseKey, decryptLicenseKey };

