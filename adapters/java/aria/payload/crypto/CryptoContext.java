package aria.payload.crypto;

import java.nio.charset.StandardCharsets;

public final class CryptoContext implements AutoCloseable {
    private static final byte[] DEFAULT_KEY_ID =
            "vendor-key-v1".getBytes(StandardCharsets.UTF_8);

    private long handle;

    private CryptoContext(long handle) {
        this.handle = handle;
    }

    public static CryptoContext create(
            CryptoProfile profile, byte[] encryptionKey, byte[] macKey) {
        return create(profile, DEFAULT_KEY_ID, encryptionKey, macKey);
    }

    public static CryptoContext create(
            CryptoProfile profile, byte[] keyId, byte[] encryptionKey, byte[] macKey) {
        CryptoNative.initialize();
        return new CryptoContext(CryptoNative.createContext(
                profile.id, keyId, encryptionKey, macKey));
    }

    public byte[] encrypt(byte[] plaintext) {
        requireOpen();
        return CryptoNative.encrypt(handle, plaintext);
    }

    public byte[] encrypt(byte[] plaintext, byte[] initialCounter) {
        requireOpen();
        return CryptoNative.encryptWithCounter(handle, plaintext, initialCounter);
    }

    public byte[] decrypt(byte[] envelope) {
        requireOpen();
        return CryptoNative.decrypt(handle, envelope);
    }

    private void requireOpen() {
        if (handle == 0) {
            throw new IllegalStateException("context is closed");
        }
    }

    @Override
    public void close() {
        if (handle != 0) {
            CryptoNative.destroyContext(handle);
            handle = 0;
        }
    }
}
