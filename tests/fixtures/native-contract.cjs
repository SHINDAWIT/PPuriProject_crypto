// TEST-ONLY interface double. It performs no cryptographic operations.
'use strict';

let created = 0;
let destroyed = 0;
function unavailable() {
  throw new Error('cryptography unavailable in the public contract test double');
}

module.exports = {
  initialize() {},
  moduleVersion: () => 'contract-test-double',
  health: () => 'contract-test-double',
  supportedProfiles: () => [],
  profileStatus: () => 'contract-test-double',
  profileState: () => 'contract-test-double',
  createContext: () => ++created,
  destroyContext: () => { destroyed += 1; },
  encrypt: unavailable,
  encryptWithCounter: unavailable,
  decrypt: unavailable,
  counts: () => ({ created, destroyed }),
};
