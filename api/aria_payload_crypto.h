#ifndef APC_ARIA_PAYLOAD_CRYPTO_H
#define APC_ARIA_PAYLOAD_CRYPTO_H

#include <stddef.h>
#include <stdint.h>

#ifdef __cplusplus
extern "C" {
#endif

#if defined(_WIN32)
#  if defined(APC_BUILDING_LIBRARY)
#    define APC_PUBLIC __declspec(dllexport)
#  else
#    define APC_PUBLIC __declspec(dllimport)
#  endif
#elif defined(__GNUC__) || defined(__clang__)
#  define APC_PUBLIC __attribute__((visibility("default")))
#else
#  define APC_PUBLIC
#endif

#define APC_API_VERSION 1u
#define APC_PROFILE_COUNT 16u
#define APC_PROFILE_01 1u
#define APC_PROFILE_02 2u
#define APC_PROFILE_03 3u
#define APC_PROFILE_04 4u
#define APC_PROFILE_05 5u
#define APC_PROFILE_06 6u
#define APC_PROFILE_07 7u /* reserved/disabled */
#define APC_PROFILE_08 8u /* reserved/disabled */
#define APC_PROFILE_09 9u /* reserved/disabled */
#define APC_PROFILE_10 10u /* reserved/disabled */
#define APC_PROFILE_11 11u /* ARIA-128-CTR-HMAC-SHA-256 */
#define APC_PROFILE_12 12u /* ARIA-128-CTR-HMAC-SHA-512 */
#define APC_PROFILE_13 13u /* ARIA-192-CTR-HMAC-SHA-256 */
#define APC_PROFILE_14 14u /* ARIA-192-CTR-HMAC-SHA-512 */
#define APC_PROFILE_15 15u /* ARIA-256-CTR-HMAC-SHA-256 */
#define APC_PROFILE_16 16u /* ARIA-256-CTR-HMAC-SHA-512 */

#define APC_MODE_PARAMETER_LEN 16u

typedef uint16_t apc_profile;

typedef enum apc_status {
    APC_OK = 0,
    APC_ERR_STATE = -1,
    APC_ERR_INVALID_ARGUMENT = -2,
    APC_ERR_PROFILE_NOT_OPERATIONAL = -3,
    APC_ERR_INVALID_ENVELOPE = -4,
    APC_ERR_RNG = -5,
    APC_ERR_LIMIT = -6,
    APC_ERR_SELF_TEST = -7,
    APC_ERR_BUFFER = -8,
    APC_ERR_COUNTER_REQUIRED = -9,
    APC_ERR_COUNTER_RANGE = -10
} apc_status;

typedef uint32_t apc_profile_state;
#define APC_PROFILE_SUPPORTED 1u
#define APC_PROFILE_DISABLED 2u
#define APC_PROFILE_UNSUPPORTED 3u

typedef struct apc_context apc_context;

typedef struct apc_buffer {
    size_t len;
    uint8_t *data;
} apc_buffer;

#define APC_BUFFER_INIT { 0u, NULL }

APC_PUBLIC apc_status apc_initialize(void);
APC_PUBLIC const char *apc_module_version(void);
APC_PUBLIC apc_status apc_health(void);
APC_PUBLIC size_t apc_supported_profiles(apc_profile *out, size_t capacity);
APC_PUBLIC apc_profile_state apc_get_profile_state(apc_profile profile);
APC_PUBLIC const char *apc_profile_state_string(apc_profile_state state);
APC_PUBLIC apc_status apc_profile_status(apc_profile profile);
APC_PUBLIC apc_status apc_context_create(apc_profile profile,
                               const uint8_t *key_id, size_t key_id_len,
                               const uint8_t *enc_key, size_t enc_key_len,
                               const uint8_t *mac_key, size_t mac_key_len,
                               apc_context **out_context);
APC_PUBLIC void apc_context_destroy(apc_context *context);

APC_PUBLIC apc_status apc_encrypt(apc_context *context,
                       const uint8_t *plaintext, size_t plaintext_len,
                       apc_buffer *out_envelope);
APC_PUBLIC apc_status apc_encrypt_with_counter(
                       apc_context *context,
                       const uint8_t *initial_counter,
                       size_t initial_counter_len,
                       const uint8_t *plaintext, size_t plaintext_len,
                       apc_buffer *out_envelope);
APC_PUBLIC apc_status apc_decrypt(apc_context *context,
                       const uint8_t *envelope, size_t envelope_len,
                       apc_buffer *out_plaintext);
APC_PUBLIC void apc_buffer_free(apc_buffer *buffer);

APC_PUBLIC const char *apc_status_string(apc_status status);

#ifdef __cplusplus
}
#endif

#endif
