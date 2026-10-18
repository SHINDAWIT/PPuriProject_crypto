# 이기종 Linux 환경의 ARIA 암호 모듈 개발·연동

[![Public contract checks](https://github.com/SHINDAWIT/PPuriProject_crypto/actions/workflows/public-checks.yml/badge.svg)](https://github.com/SHINDAWIT/PPuriProject_crypto/actions/workflows/public-checks.yml)

**기존 C 기반 암호 모듈을 Node-RED와 Java Bridge에서 호출하도록 구성하고, 변경·구체화되는 실행환경에 맞춰 바이너리와 전달 자료를 준비한 연구실 프로젝트입니다.**

이 저장소에는 프로젝트의 **C 인터페이스·Node/Java 어댑터**, 실행환경 분석, 시험 기록과 협력사 연동 과정을 정리했습니다.

| 항목 | 내용 |
|---|---|
| 프로젝트 | 부산대학교 석사과정 연구실 과제, 팀 공동 진행 |
| 프로젝트 기술 | C, JavaScript/Node.js, Java/JNI, Docker, Linux(Ubuntu·Alpine), CMake |
| 담당 업무 | 적용 구간·실행환경·버전 조사, 요구사항 정리, AI 개발도구를 활용한 개발·수정·재시험, 전달본·사용 문서 검토, 모듈 전달 |
| 모듈 전달 | 모듈을 협력사에 전달했으며, 협력사는 수령 후 적용·시험을 진행하겠다고 회신 |
| 개발 범위 | 기존 ARIA 구현을 활용한 KCMVP 준비 단계의 연동 PoC |

## 3분 안에 살펴보기

1. **[환경 변경 대응과 문제 해결](docs/CASE_STUDY.md)** — 이미지·Java 버전, libc 경계, API·문서 정합성
2. **[시험 구성과 결과](docs/VALIDATION.md)** — 배포 패키지의 시험 기록과 공개 코드 검사
3. **[협력사 요구사항과 모듈 전달](docs/COMMUNICATION.md)** — 적용 구간·실행환경 협의와 전달 이력
4. **[코드 안내](docs/CODE_GUIDE.md)** — C 인터페이스, Node·Java 어댑터와 호출 예제

## 개발·연동 구조

~~~mermaid
flowchart LR
    A["Edge Node-RED<br/>UTF-8 JSON"] --> B["Node wrapper → N-API<br/>C 암호 모듈"]
    B --> C["Kafka<br/>암호화 payload"]
    C --> D["별도 Java Bridge<br/>JNI → C 암호 모듈"]
    D --> E["기존 평문 topic"]
    E --> F["기존 Spark 처리"]
~~~

협력사가 제안한 Bridge 구조에 맞춰 암호 적용 구간과 모듈 호출 환경을 확인하고, 대상별 구성과 시험을 진행했습니다. 운영 Bridge 애플리케이션은 협력사 연동 시스템의 별도 구성입니다.

| 실행 대상 | 실행환경 | 전달 구성 |
|---|---|---|
| Edge Node-RED | 고정한 Node-RED 4.0.5 이미지, Alpine/musl, Node 20.18.0, N-API 9 | native library + Node addon + JavaScript wrapper |
| Java Bridge | Ubuntu 22.04/glibc 2.35, Java 21 | native library + JNI + API JAR |

**Ubuntu 호스트라는 정보만으로 Node-RED용 바이너리를 정할 수 없었습니다.** 실제 모듈이 로드되는 컨테이너의 libc와 Node-API, Bridge 프로세스의 Java 버전을 구분해야 했습니다.

## 시험 및 전달 결과

| 구분 | 내용 |
|---|---|
| 배포 패키지의 시험 요약 | 대상 이미지 내 로딩, Node→Java 상호운용, 변조·잘못된 입력 거부, 대표 CBC/CTR Kafka 왕복의 PASS 기록 |
| 협력사 전달 | 모듈 전달 및 수령 회신, 후속 적용·시험 예정 |
| 공개 코드 검사 | 인터페이스·어댑터 무결성, Node 입력·수명주기 계약, C 헤더 및 Java 코드 컴파일 |

배포 패키지의 시험 요약은 패키징 템플릿으로 생성되었습니다. 원시 로그 대조, 실제 Node-RED Flow 배포, 협력사 적용·수용 시험은 별도 검증 항목입니다. 시험 구성과 기록의 생성 방식은 [시험 문서](docs/VALIDATION.md)에 설명했습니다.

초기 요구는 Node-RED 팔레트 노드 형태였으며, 보관된 패키지는 라이브러리·wrapper·예제 중심입니다. 설치형 custom node는 포함하지 않습니다. 요구사항과 패키지 구성은 [협의 기록](docs/COMMUNICATION.md)에 정리했습니다.

## 코드와 실행

| 살펴볼 파일 | 보여주는 내용 |
|---|---|
| [C 공개 헤더](api/aria_payload_crypto.h) | opaque context, 버퍼 소유권을 가진 C ABI, 상태·오류 코드 |
| [Node wrapper](adapters/node/index.js) · [타입 선언](adapters/node/index.d.ts) | native addon 호출, keyId 길이 검사, 종료 후 호출 거부 |
| [Java CryptoContext](adapters/java/aria/payload/crypto/CryptoContext.java) | JNI 호출, 명시적 keyId, AutoCloseable 수명주기 |
| [Node 호출 예제](examples/node/encrypt-payload.cjs) · [Java 호출 예제](examples/java/DecryptEnvelope.java) | 직렬화 완료 데이터의 전달, 오류 전파, 임시 버퍼 정리 |
| [공개 계약 시험](tests/node-contract.test.cjs) | 암호 연산을 하지 않는 테스트 더블로 어댑터 경계와 예제 오류 경로 확인 |

Python 3.10+, Node.js 20+, C 컴파일러와 JDK 17+가 있는 환경에서:

~~~bash
python3 tools/run_checks.py
~~~

별도 패키지 설치 없이 표준 도구로 실행합니다. 이 명령과 Actions 배지는 **공개 코드의 계약·컴파일 검사**를 가리킵니다. 실제 ARIA 암복호화와 대상 컨테이너의 시험에는 별도의 비공개 native 구현·바이너리가 필요합니다.

[기술 참고자료](docs/REFERENCES.md) · [공개 범위와 자료 출처](docs/PUBLICATION.md)

암호 구현 소스·배포 바이너리·원본 메일·업체 데이터와 내부 Git 이력은 공개 대상에서 제외했습니다.
