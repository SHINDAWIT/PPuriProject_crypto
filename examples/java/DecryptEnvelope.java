package portfolio;

import aria.payload.crypto.CryptoContext;
import aria.payload.crypto.CryptoProfile;

/**
 * Portfolio-only JNI calling example; no Kafka/Flow deployment is included.
 * The caller must clear the returned plaintext after downstream processing,
 * and owns the lifetime of the supplied key arrays.
 */
public final class DecryptEnvelope {
    private DecryptEnvelope() {}

    public static byte[] decryptForBridge(
            byte[] envelope, byte[] keyId, byte[] encryptionKey, byte[] macKey) {
        try (CryptoContext context = CryptoContext.create(
                CryptoProfile.ARIA_256_CBC_HMAC_SHA_256,
                keyId, encryptionKey, macKey)) {
            return context.decrypt(envelope);
        }
    }
}
