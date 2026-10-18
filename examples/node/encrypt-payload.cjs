// Portfolio-only calling example; requires the original external native module.
// The caller owns the original key buffers and the returned encrypted Envelope.
'use strict';

function encryptJsonForKafka(crypto, jsonText, keys) {
  if (typeof jsonText !== 'string') {
    throw new TypeError('jsonText must be an already serialized JSON string');
  }
  if (!keys || !Buffer.isBuffer(keys.encryptionKey) || !Buffer.isBuffer(keys.macKey)) {
    throw new TypeError('caller-provided key buffers are required');
  }
  if (typeof keys.keyId !== 'string' || keys.keyId.length === 0) {
    throw new TypeError('an explicit keyId is required');
  }

  const encryptionKey = Buffer.from(keys.encryptionKey);
  const macKey = Buffer.from(keys.macKey);
  const plaintext = Buffer.from(jsonText, 'utf8');
  let context;
  try {
    context = crypto.createContext({
      profile: 'ARIA-256-CBC-HMAC-SHA-256',
      keyId: keys.keyId,
      encryptionKey,
      macKey,
    });
    return context.encrypt({ plaintext });
  } finally {
    try {
      if (context) context.close();
    } finally {
      plaintext.fill(0);
      encryptionKey.fill(0);
      macKey.fill(0);
    }
  }
}

module.exports = { encryptJsonForKafka };
