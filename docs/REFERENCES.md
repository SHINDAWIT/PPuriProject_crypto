# 기술 참고자료

[처음으로](../README.md)

ARIA 알고리즘, 암호 운용 방식과 언어별 native 호출 인터페이스를 설명하는 기술 명세와 공식 문서다.

| 자료 | 이 프로젝트와 연결되는 부분 |
|---|---|
| [RFC 5794 — A Description of the ARIA Encryption Algorithm](https://www.rfc-editor.org/rfc/rfc5794.html) | 재사용한 ARIA 알고리즘의 기술 명세. Informational RFC |
| [NIST SP 800-38A](https://csrc.nist.gov/pubs/sp/800/38/a/final) | CBC·CTR 운용과 IV·counter 조건의 참고 기준 |
| [RFC 4231 — HMAC-SHA test cases](https://www.rfc-editor.org/rfc/rfc4231.html) | 저장소의 HMAC 시험 벡터와 관련된 참고자료 |
| [Node.js 20.18.0 Node-API](https://nodejs.org/download/release/v20.18.0/docs/api/n-api.html) | Node addon과 ABI 안정성 경계를 이해하기 위한 문서 |
| [Java 21 JNI Specification](https://docs.oracle.com/en/java/javase/21/docs/specs/jni/index.html) | Java API에서 native library를 호출하는 인터페이스 문서 |

Node-API의 ABI 안정성과 별개로, native 라이브러리는 실행환경의 libc와 외부 의존성에 맞춰 빌드해야 한다.
