#include "aria_payload_crypto.h"

/* Compile-only public ABI usage. This file is never linked or executed. */
apc_status portfolio_decrypt_example(apc_context *context,
                                    const uint8_t *envelope, size_t length) {
    apc_buffer plaintext = APC_BUFFER_INIT;
    apc_status status = apc_decrypt(context, envelope, length, &plaintext);
    apc_buffer_free(&plaintext);
    return status;
}
