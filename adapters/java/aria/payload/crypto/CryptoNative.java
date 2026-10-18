package aria.payload.crypto;

/** Minimal JNI surface for the Phase 1 vertical slice. */
public final class CryptoNative {
    static {
        System.loadLibrary("aria_payload_crypto_jni");
    }

    private CryptoNative() {}

    public static native void initialize();
    public static native String moduleVersion();
    public static native String health();
    public static native int[] supportedProfiles();
    public static native String profileStatus(int profile);
    public static native String profileState(int profile);
    public static native long createContext(int profile, byte[] keyId, byte[] encKey, byte[] macKey);
    public static native byte[] encrypt(long context, byte[] plaintext);
    public static native byte[] encryptWithCounter(long context, byte[] plaintext, byte[] initialCounter);
    public static native byte[] decrypt(long context, byte[] envelope);
    public static native void destroyContext(long context);
}
