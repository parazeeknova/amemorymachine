import { randomBytes, scryptSync, createCipheriv, createDecipheriv } from "node:crypto";
import { getMachineId } from "./paths";

const KEY_SALT = Buffer.from("verso-desktop-storage-v1", "utf-8");

const getAppKey = (): Buffer => {
  const machineId = getMachineId() ?? "verso-default-key";
  return scryptSync(machineId, KEY_SALT, 32);
};

export interface EncryptedPayload {
  encryptedData: string;
  iv: string;
  tag: string;
}

export const encrypt = (plaintext: string): EncryptedPayload => {
  const key = getAppKey();
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  let encrypted = cipher.update(plaintext, "utf-8", "base64");
  encrypted += cipher.final("base64");
  const authTag = cipher.getAuthTag();
  return {
    encryptedData: encrypted,
    iv: iv.toString("base64"),
    tag: authTag.toString("base64"),
  };
};

export const decrypt = (payload: EncryptedPayload): string | null => {
  try {
    const key = getAppKey();
    const iv = Buffer.from(payload.iv, "base64");
    const tag = Buffer.from(payload.tag, "base64");
    const encryptedData = Buffer.from(payload.encryptedData, "base64");
    const decipher = createDecipheriv("aes-256-gcm", key, iv);
    decipher.setAuthTag(tag);
    let decrypted = decipher.update(encryptedData, undefined, "utf-8");
    decrypted += decipher.final("utf-8");
    return decrypted;
  } catch {
    return null;
  }
};
