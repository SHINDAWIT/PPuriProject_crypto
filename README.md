# 이기종 Linux 환경의 ARIA 암호 모듈 개발·연동·전달

[![Public contract checks](https://github.com/SHINDAWIT/PPuriProject_crypto/actions/workflows/public-checks.yml/badge.svg)](https://github.com/SHINDAWIT/PPuriProject_crypto/actions/workflows/public-checks.yml)

**기존 C 기반 암호 모듈을 Node-RED와 Java Bridge에서 호출하도록 구성하고, 변경·구체화되는 실행환경에 맞춰 바이너리와 전달 자료를 준비한 연구실 프로젝트입니다.**

이 저장소는 채용 검토를 위한 공개 포트폴리오입니다. 원 프로젝트에서 선별한 **C 인터페이스·Node/Java 어댑터**, 환경 확인 과정, 시험 기록 요약과 전달 결과를 담았습니다.

| 항목 | 내용 |
|---|---|
| 프로젝트 맥락 | 부산대학교 석사과정 연구실 프로젝트 과제, 팀 공동 진행 |
| 확인 가능한 개발 기록 | 2026.07.23~2026.08.12, Git 기록 기준. 실제 전체 참여 기간과 구분 |
| 프로젝트 기술 | C, JavaScript/Node.js, Java/JNI, Docker, Linux(Ubuntu·Alpine), CMake |
| 나의 담당 | 적용 구간·환경·버전 질의, 요구사항 전달과 범위 정리, 전달본·사용 문서 검토, AI 개발도구를 활용한 개발·수정·재시험 진행, 모듈 전달 |
| 확인된 전달 결과 | 사용자 제공 메일에서 모듈 전송 및 협력사 수령 확인. 협력사는 적용·시험을 진행하겠다고 회신 |
| 프로젝트 상태 | 기존 ARIA 구현을 재사용한 KCMVP 준비 단계 PoC. KCMVP 검증·인증 획득을 의미하지 않음 |

## 3분 안에 살펴보기

1. **[무엇이 어려웠고 어떻게 대응했나](docs/CASE_STUDY.md)** — 이미지·Java 버전의 변경과 구체화, libc 경계, API·문서 불일치, 실제 담당 범위
2. **[무엇을 검증했고 어디까지 확인됐나](docs/VALIDATION.md)** — 기존 배포물의 시험 기록과 공개 코드의 현재 검사를 분리
3. **[협력사와 무엇을 확인했나](docs/COMMUNICATION.md)** — 메일 원문 대신 익명화한 요구사항·결정·전달 이력
4. **[어떤 코드를 볼 수 있나](docs/CODE_GUIDE.md)** — 기존 인터페이스·어댑터와 이번 공개용 호출 예제의 구분

## 개발·연동 구조

~~~mermaid
flowchart LR
    A["Edge Node-RED<br/>UTF-8 JSON"] --> B["Node wrapper → N-API<br/>C 암호 모듈"]
    B --> C["Kafka<br/>암호화 payload"]
    C --> D["별도 Java Bridge<br/>JNI → C 암호 모듈"]
    D --> E["기존 평문 topic"]
    E --> F["기존 Spark 처리"]
~~~

Bridge 구조는 **협력사가 제안**했습니다. 저는 암호 적용 구간과 실제 모듈 호출 환경을 질의·확인하고, 개발도구에 전달해 대상별 구성과 시험을 진행했습니다. 실제 운영 Bridge 애플리케이션은 연동 시스템의 별도 구성 범위입니다.

| 실행 대상 | 확인·구성한 환경 | 전달 구성 |
|---|---|---|
| Edge Node-RED | 고정한 Node-RED 4.0.5 이미지, Alpine/musl, Node 20.18.0, N-API 9 | native library + Node addon + JavaScript wrapper |
| Java Bridge | Ubuntu 22.04/glibc 2.35, Java 21 | native library + JNI + API JAR |

**Ubuntu 호스트라는 정보만으로 Node-RED용 바이너리를 정할 수 없었습니다.** 실제 모듈이 로드되는 컨테이너의 libc와 Node-API, Bridge 프로세스의 Java 버전을 구분해야 했습니다.

## 결과를 읽는 기준

| 근거 | 확인할 수 있는 결과 |
|---|---|
| 기존 배포물의 시험 문서 | 대상 이미지 내 로딩, Node→Java 상호운용, 변조·잘못된 입력 거부, 대표 CBC/CTR Kafka 왕복의 PASS 기록 |
| 이번에 제공된 메일 내용 | 모듈 전달과 수령 확인. 이후 적용·시험 예정이라는 회신 |
| 이 저장소의 공개 검사 | 인터페이스·어댑터 무결성, Node 입력·수명주기 계약, C 헤더 및 Java 코드 컴파일 |

기존 시험 문서는 패키징 템플릿으로 생성된 요약입니다. 원시 실행 로그 전체를 독립 검증한 결과와 구분합니다. **실제 Node-RED Flow 배포, 고객 실장비 운영, 고객 수용 완료는 확인되지 않았습니다.** 메일에 날짜·첨부파일 해시가 없어 수령한 파일과 현재 보관된 후보 배포물의 바이트 일치도 확정하지 않았습니다.

초기 메일에는 팔레트 노드 형태의 요구가 있었습니다. 보관된 최종 후보는 라이브러리·wrapper·예제 중심이며 설치형 custom node는 포함하지 않습니다. 이 차이와 확인 범위는 [협의 기록](docs/COMMUNICATION.md)에 정리했습니다.

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

이 과제는 논문 실적이 아닌 연구실 프로젝트입니다. 암호 구현 소스·배포 바이너리·원본 메일·업체 데이터와 비공개 Git 이력은 이 저장소에 포함하지 않았습니다.
