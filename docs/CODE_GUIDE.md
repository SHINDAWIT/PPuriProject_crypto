# 공개 코드 읽기

[처음으로](../README.md) · [검증 범위](VALIDATION.md)

## 기존 프로젝트에서 선별한 코드

| 파일 | 검토할 부분 |
|---|---|
| [aria_payload_crypto.h](../api/aria_payload_crypto.h) | 공통 context·버퍼·상태 코드, CBC와 명시적 counter API |
| [Node index.js](../adapters/node/index.js) | addon 호출 변환, keyId 길이 검사, close 후 재사용 차단 |
| [Node index.d.ts](../adapters/node/index.d.ts) | 실제 export와 입력 형식에 대응하는 타입 선언 |
| [CryptoNative.java](../adapters/java/aria/payload/crypto/CryptoNative.java) | 최소 JNI 선언과 로더 |
| [CryptoContext.java](../adapters/java/aria/payload/crypto/CryptoContext.java) | 명시적 keyId·AutoCloseable·종료 후 호출 거부 |
| [CryptoProfile.java](../adapters/java/aria/payload/crypto/CryptoProfile.java) | 고정 profile ID |

6개 파일은 기존 소스에서 내용 변경 없이 선별했다. 원본 경로와 SHA-256은 [파일 출처](../evidence/source_manifest.json)에 기록했다. 기존 파일의 코딩 스타일도 보존했으며, 모든 코드의 개인 수작업 작성을 주장하지 않는다.

Node wrapper는 실제 native addon이 필요하고 Java API는 JNI library가 필요하다. 바이너리는 공개본에 포함하지 않아 이 파일들만으로 실제 암복호화가 실행되지는 않는다. Node wrapper의 APC_NODE_ADDON은 제공된 addon 경로를 지정하는 원래 로딩 인터페이스이며 평문 우회 경로가 아니다.

## 이번 공개용으로 작성한 호출 예제

- [encrypt-payload.cjs](../examples/node/encrypt-payload.cjs): 직렬화가 완료된 JSON 문자열을 CBC context로 암호화하도록 호출한다. 오류는 호출자에게 전파하며 임시 평문·키 복사본을 정리한다. 호출자 소유 원본 키의 수명 관리는 호출자 책임이다.
- [DecryptEnvelope.java](../examples/java/DecryptEnvelope.java): JNI context를 닫으며 인증·복호화 결과를 호출자에게 전달한다. 반환 평문은 후속 처리 후 호출자가 지워야 한다.

두 예제는 **공개 설명을 위해 새로 작성한 호출 코드**다. 기존 업체 전달본의 파일 자체나 실제 Node-RED Flow·운영 Bridge 애플리케이션이 아니다. 암호 primitive를 구현하거나 원 구현을 다른 알고리즘으로 대체하지 않는다.

## 공개 검사

[run_checks.py](../tools/run_checks.py)는 Node 계약 시험, C 헤더와 Java 컴파일, 문서·자료 검사를 순서대로 실행한다. [Node 계약 시험](../tests/node-contract.test.cjs)과 [테스트 더블](../tests/fixtures/native-contract.cjs)은 입력·오류·수명주기만 다루며 실제 암호 연산을 제공하지 않는다.

C ABI와 Java 코드는 컴파일 단계까지만 확인한다. Node wrapper에 추가 설치되는 npm 의존성은 없다. C++ 빌드 설정의 존재나 이번 공개 검사에 쓰는 Python을 과거 직접 개발 언어 실적으로 바꾸어 소개하지 않는다.
