const crypto = require("crypto");
const key = process.env.ENCRYPTION_PASSWORD;
const iv = crypto.randomBytes(16);

function encrypt(resetToken) {
  let cipher = crypto.createCipheriv("aes-256-cbc", Buffer.from(key), iv);
  let encrypted = cipher.update(resetToken);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return {
    iv: iv.toString("hex"),
    encryptedData: encrypted.toString("hex"),
  };
}

function decrypt(resetToken) {
  let iv = Buffer.from(resetToken.iv, "hex");
  let encryptedText = Buffer.from(resetToken.encryptedData, "hex");
  let decipher = crypto.createDecipheriv("aes-256-cbc", Buffer.from(key), iv);
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
}

exports.encrypt = encrypt;
exports.decrypt = decrypt;
