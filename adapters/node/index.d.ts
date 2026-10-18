export type ProfileName =
  | 'ARIA-128-CBC-HMAC-SHA-256'
  | 'ARIA-128-CBC-HMAC-SHA-512'
  | 'ARIA-192-CBC-HMAC-SHA-256'
  | 'ARIA-192-CBC-HMAC-SHA-512'
  | 'ARIA-256-CBC-HMAC-SHA-256'
  | 'ARIA-256-CBC-HMAC-SHA-512'
  | 'ARIA-128-CTR-HMAC-SHA-256'
  | 'ARIA-128-CTR-HMAC-SHA-512'
  | 'ARIA-192-CTR-HMAC-SHA-256'
  | 'ARIA-192-CTR-HMAC-SHA-512'
  | 'ARIA-256-CTR-HMAC-SHA-256'
  | 'ARIA-256-CTR-HMAC-SHA-512';

export type ProfileState = 'SUPPORTED' | 'DISABLED' | 'UNSUPPORTED';

export interface EncryptInput {
  plaintext: Buffer;
  initialCounter?: Buffer;
}

export interface CryptoContext {
  encrypt(input: EncryptInput): Buffer;
  decrypt(envelope: Buffer): Buffer;
  close(): void;
}

export interface CreateContextOptions {
  profile: ProfileName | number;
  encryptionKey: Buffer;
  macKey: Buffer;
  keyId?: string | Buffer;
}

export declare const profiles: Readonly<Record<ProfileName, number>>;
export declare function initialize(): void;
export declare function moduleVersion(): string;
export declare function health(): string;
export declare function supportedProfiles(): number[];
export declare function profileStatus(profile: number): string;
export declare function profileState(profile: number): ProfileState;
export declare function createContext(options: CreateContextOptions): CryptoContext;
