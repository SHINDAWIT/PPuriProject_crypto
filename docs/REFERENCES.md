# 기술 참고자료

[처음으로](../README.md)

이 과제는 연구실 프로젝트이며 논문 실적과 관련되지 않는다는 사용자 확인을 반영했다. 아래는 기술 맥락을 설명하는 원문 링크로, 본인의 저술·발표 논문 목록이 아니다. 원문 PDF를 복제해 올리지 않았다.

| 자료 | 이 프로젝트와 연결되는 부분 |
|---|---|
| [RFC 5794 — A Description of the ARIA Encryption Algorithm](https://www.rfc-editor.org/rfc/rfc5794.html) | 재사용한 ARIA 알고리즘의 기술 명세. Informational RFC |
| [NIST SP 800-38A](https://csrc.nist.gov/pubs/sp/800/38/a/final) | CBC·CTR 운용과 IV·counter 조건의 참고 기준 |
| [RFC 4231 — HMAC-SHA test cases](https://www.rfc-editor.org/rfc/rfc4231.html) | 저장소의 HMAC 시험 벡터와 관련된 참고자료 |
| [Node.js 20.18.0 Node-API](https://nodejs.org/download/release/v20.18.0/docs/api/n-api.html) | Node addon과 ABI 안정성 경계를 이해하기 위한 문서 |
| [Java 21 JNI Specification](https://docs.oracle.com/en/java/javase/21/docs/specs/jni/index.html) | Java API에서 native library를 호출하는 인터페이스 문서 |

참고자료의 존재는 구현의 인증·운영 안전성·KCMVP 검증을 입증하지 않는다. Node-API의 ABI 안정성도 서로 다른 libc나 모든 외부 native 의존성의 호환성을 보장하는 것으로 확대하지 않는다.
