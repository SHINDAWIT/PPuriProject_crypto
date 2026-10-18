// TEST-ONLY: fixed non-production buffers, never printed.
// These tests validate JS calling contracts, not native cryptography.
'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');
const fs = require('node:fs');
const test = require('node:test');

process.env.APC_NODE_ADDON = path.join(__dirname, 'fixtures/native-contract.cjs');
const crypto = require('../adapters/node');
const native = require('./fixtures/native-contract.cjs');
const { encryptJsonForKafka } = require('../examples/node/encrypt-payload.cjs');

function keys() {
  return {
    keyId: 'TEST-ONLY-portfolio-key',
    encryptionKey: Buffer.alloc(32, 0x11),
    macKey: Buffer.alloc(32, 0x22),
  };
}

function withContext(run) {
  const input = keys();
  let context;
  try {
    context = crypto.createContext({ profile: 5, ...input });
    return run(context);
  } finally {
    if (context) context.close();
    input.encryptionKey.fill(0);
    input.macKey.fill(0);
  }
}

test('profile registry and runtime exports match the declared public names', () => {
  assert.equal(Object.keys(crypto.profiles).length, 12);
  assert.equal(crypto.profiles['ARIA-256-CBC-HMAC-SHA-256'], 5);
  assert.equal(crypto.profiles['ARIA-256-CTR-HMAC-SHA-256'], 15);
  assert.ok(Object.isFrozen(crypto.profiles));
  const declaration = fs.readFileSync(
    path.join(__dirname, '../adapters/node/index.d.ts'), 'utf8');
  const declared = [...declaration.matchAll(/export declare (?:function|const) (\w+)/g)]
    .map((match) => match[1]).sort();
  assert.deepEqual(Object.keys(crypto).sort(), declared);
});

test('empty and overlong keyId are refused at the JS boundary', () => {
  const input = keys();
  try {
    for (const keyId of ['', Buffer.alloc(129)]) {
      assert.throws(() => crypto.createContext({ profile: 5, ...input, keyId }),
        /keyId must be 1 to 128 bytes/);
    }
  } finally {
    input.encryptionKey.fill(0);
    input.macKey.fill(0);
  }
});

test('an unknown named profile is refused', () => {
  const input = keys();
  try {
    assert.throws(() => crypto.createContext({ profile: 'UNKNOWN', ...input }),
      /unsupported profile/);
  } finally {
    input.encryptionKey.fill(0);
    input.macKey.fill(0);
  }
});

test('close is idempotent and blocks every later operation', () => {
  withContext((context) => {
    const before = native.counts().destroyed;
    context.close();
    context.close();
    assert.equal(native.counts().destroyed, before + 1);
    assert.throws(() => context.encrypt({ plaintext: Buffer.alloc(0) }), /context is closed/);
    assert.throws(() => context.encrypt({
      plaintext: Buffer.alloc(0), initialCounter: Buffer.alloc(16),
    }), /context is closed/);
    assert.throws(() => context.decrypt(Buffer.alloc(0)), /context is closed/);
  });
});

test('plaintext and counter inputs are validated before native dispatch', () => {
  withContext((context) => {
    assert.throws(() => context.encrypt({ plaintext: 'wrong type' }), /plaintext must be a Buffer/);
    for (const initialCounter of [Buffer.alloc(15), Buffer.alloc(17), 'wrong type']) {
      assert.throws(() => context.encrypt({ plaintext: Buffer.alloc(0), initialCounter }),
        /initialCounter must be a 16-byte Buffer/);
    }
  });
});

test('the double refuses actual encryption and decryption; there is no success fallback', () => {
  withContext((context) => {
    assert.throws(() => context.encrypt({ plaintext: Buffer.alloc(0) }), /cryptography unavailable/);
    assert.throws(() => context.decrypt(Buffer.alloc(0)), /cryptography unavailable/);
  });
});

test('calling example clears its temporary copies when native encryption fails', () => {
  const input = keys();
  let options;
  let plaintext;
  let closed = false;
  const failingApi = {
    createContext(value) {
      options = value;
      return {
        encrypt(request) {
          plaintext = request.plaintext;
          throw new Error('TEST-ONLY native failure');
        },
        close() { closed = true; },
      };
    },
  };
  try {
    assert.throws(() => encryptJsonForKafka(failingApi, '{}', input), /native failure/);
    assert.ok(closed);
    assert.ok(plaintext.every((value) => value === 0));
    assert.ok(options.encryptionKey.every((value) => value === 0));
    assert.ok(options.macKey.every((value) => value === 0));
    assert.ok(input.encryptionKey.every((value) => value === 0x11));
    assert.ok(input.macKey.every((value) => value === 0x22));
  } finally {
    input.encryptionKey.fill(0);
    input.macKey.fill(0);
  }
});

test('calling example rejects an un-serialized object and cleans up creation failures', () => {
  const input = keys();
  let options;
  const failingApi = {
    createContext(value) {
      options = value;
      throw new Error('TEST-ONLY context creation failure');
    },
  };
  try {
    assert.throws(() => encryptJsonForKafka(failingApi, {}, input), /already serialized/);
    assert.throws(() => encryptJsonForKafka(failingApi, '{}', input), /creation failure/);
    assert.ok(options.encryptionKey.every((value) => value === 0));
    assert.ok(options.macKey.every((value) => value === 0));
  } finally {
    input.encryptionKey.fill(0);
    input.macKey.fill(0);
  }
});
