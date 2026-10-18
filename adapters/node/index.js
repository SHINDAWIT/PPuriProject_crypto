const native = require(process.env.APC_NODE_ADDON || '../../build/node/apc_node.node');

const ids = {
  'ARIA-128-CBC-HMAC-SHA-256': 1,
  'ARIA-128-CBC-HMAC-SHA-512': 2,
  'ARIA-192-CBC-HMAC-SHA-256': 3,
  'ARIA-192-CBC-HMAC-SHA-512': 4,
  'ARIA-256-CBC-HMAC-SHA-256': 5,
  'ARIA-256-CBC-HMAC-SHA-512': 6,
  'ARIA-128-CTR-HMAC-SHA-256': 11,
  'ARIA-128-CTR-HMAC-SHA-512': 12,
  'ARIA-192-CTR-HMAC-SHA-256': 13,
  'ARIA-192-CTR-HMAC-SHA-512': 14,
  'ARIA-256-CTR-HMAC-SHA-256': 15,
  'ARIA-256-CTR-HMAC-SHA-512': 16,
};

function profileId(name) {
  if (typeof name === 'number') return name;
  if (!ids[name]) throw new TypeError('unsupported profile');
  return ids[name];
}

function keyIdBuffer(value) {
  const keyId = value === undefined ? Buffer.from('vendor-key-v1') : Buffer.from(value);
  if (keyId.length < 1 || keyId.length > 128) {
    throw new TypeError('keyId must be 1 to 128 bytes');
  }
  return keyId;
}

function createContext(options) {
  if (!options || !Buffer.isBuffer(options.encryptionKey) ||
      !Buffer.isBuffer(options.macKey)) {
    throw new TypeError('keys must be Buffers');
  }
  native.initialize();
  const handle = native.createContext(
    profileId(options.profile),
    keyIdBuffer(options.keyId),
    options.encryptionKey,
    options.macKey,
  );
  let closed = false;
  const requireOpen = () => {
    if (closed) throw new Error('context is closed');
  };
  return {
    encrypt(input) {
      requireOpen();
      if (!input || !Buffer.isBuffer(input.plaintext)) {
        throw new TypeError('plaintext must be a Buffer');
      }
      if (input.initialCounter === undefined) {
        return native.encrypt(handle, input.plaintext);
      }
      if (!Buffer.isBuffer(input.initialCounter) || input.initialCounter.length !== 16) {
        throw new TypeError('initialCounter must be a 16-byte Buffer');
      }
      return native.encryptWithCounter(handle, input.plaintext, input.initialCounter);
    },
    decrypt(envelope) {
      requireOpen();
      return native.decrypt(handle, envelope);
    },
    close() {
      if (!closed) {
        native.destroyContext(handle);
        closed = true;
      }
    },
  };
}

module.exports = {
  initialize: native.initialize,
  moduleVersion: native.moduleVersion,
  health: native.health,
  supportedProfiles: native.supportedProfiles,
  profileStatus: native.profileStatus,
  profileState: native.profileState,
  createContext,
  profiles: Object.freeze(ids),
};
