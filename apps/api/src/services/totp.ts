import crypto from 'crypto';

// Decode base32 to buffer
function base32Decode(base32: string): Buffer {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  const clean = base32.toUpperCase().replace(/=+$/, '');
  const length = clean.length;
  let bits = 0;
  let value = 0;
  let index = 0;
  const buffer = Buffer.alloc(Math.floor((length * 5) / 8));

  for (let i = 0; i < length; i++) {
    const char = clean[i];
    const val = alphabet.indexOf(char);
    if (val === -1) throw new Error('Invalid base32 character');
    value = (value << 5) | val;
    bits += 5;
    if (bits >= 8) {
      buffer[index++] = (value >> (bits - 8)) & 255;
      bits -= 8;
    }
  }
  return buffer;
}

// Generate a random 16-character base32 secret
export function generateSecret(): string {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  let secret = '';
  const bytes = crypto.randomBytes(10); // 10 bytes = 80 bits of entropy
  for (let i = 0; i < bytes.length; i++) {
    secret += alphabet[bytes[i] % 32];
  }
  return secret;
}

// Generate TOTP code
export function generateTOTP(secret: string, timeStep = 30): string {
  const key = base32Decode(secret);
  const epoch = Math.floor(Date.now() / 1000);
  const counter = Math.floor(epoch / timeStep);
  const buffer = Buffer.alloc(8);
  
  let tmp = counter;
  for (let i = 7; i >= 0; i--) {
    buffer[i] = tmp & 0xff;
    tmp = Math.floor(tmp / 256);
  }

  const hmac = crypto.createHmac('sha1', key).update(buffer).digest();
  const offset = hmac[hmac.length - 1] & 0xf;
  const code =
    ((hmac[offset] & 0x7f) << 24) |
    ((hmac[offset + 1] & 0xff) << 16) |
    ((hmac[offset + 2] & 0xff) << 8) |
    (hmac[offset + 3] & 0xff);

  return String(code % 1000000).padStart(6, '0');
}

// Verify TOTP code
export function verifyTOTP(secret: string, code: string, window = 1, timeStep = 30): boolean {
  try {
    const key = base32Decode(secret);
    const epoch = Math.floor(Date.now() / 1000);
    const counter = Math.floor(epoch / timeStep);

    for (let i = -window; i <= window; i++) {
      const buffer = Buffer.alloc(8);
      let tmp = counter + i;
      for (let j = 7; j >= 0; j--) {
        buffer[j] = tmp & 0xff;
        tmp = Math.floor(tmp / 256);
      }

      const hmac = crypto.createHmac('sha1', key).update(buffer).digest();
      const offset = hmac[hmac.length - 1] & 0xf;
      const computedCode =
        ((hmac[offset] & 0x7f) << 24) |
        ((hmac[offset + 1] & 0xff) << 16) |
        ((hmac[offset + 2] & 0xff) << 8) |
        (hmac[offset + 3] & 0xff);

      const matchCode = String(computedCode % 1000000).padStart(6, '0');
      if (matchCode === code) return true;
    }
  } catch (e) {
    console.error('TOTP verification error:', e);
  }
  return false;
}
