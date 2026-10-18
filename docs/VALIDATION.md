# 시험 기록과 현재 공개 코드의 검사

[처음으로](../README.md) · [기존 배포 기록 요약](../evidence/release_verification.json) · [공개 코드 검사 기록](../evidence/portfolio_checks.json)

## 1. 기존 후보 배포물에 남은 기록

| 항목 | 보관된 문서에 기록된 결과 |
|---|---|
| Edge 로딩 | 고정 Node-RED 4.0.5 이미지 내 native library·Node addon 로딩 PASS |
| Bridge 로딩 | Ubuntu 22.04/glibc 2.35/Java 21의 native·JNI·JAR 로딩 PASS |
| CBC·CTR | CBC 1~6, 조건부 CTR 11~16의 암복호화 PASS |
| 언어 간 상호운용 | Edge 생성 Envelope의 Java Bridge 복호화 PASS |
| 오류 경로 | 변조 거부, keyId 길이 경계값, 종료된 context 재사용 거부 PASS |
| Kafka | 대표 CBC/CTR의 binary Envelope 왕복과 성공 후 offset 처리 PASS |

시험 문서의 source revision은 fce89ed21201f454896b8c01016f741a845a221d이며, 문서 시각은 2026-08-12 02:37:11 UTC다. 기존 압축파일의 SHA-256과 요약 14개 항목은 [기계 판독 기록](../evidence/release_verification.json)에 남겼다. 14는 보고서에 있는 PASS 표기의 수이며 독립 시험 시나리오 수나 개인 수행 횟수가 아니다.

### 증거의 한계

원 저장소의 패키징 스크립트는 PASS 문구가 포함된 템플릿으로 TEST_RESULTS.md를 생성한다. 대상 이미지 빌드·Node/Java 시험·상호운용·Kafka 시험 뒤 패키징하는 실행 스크립트도 존재하지만, 요약 문서의 존재만으로 당시 모든 실행의 성공을 독립 증명할 수는 없다.

이번 포트폴리오 작업에서는 원시 실행 로그 전체를 대조하거나 기존 native 암호 시험을 재실행하지 않았다. 따라서 **“기존 배포물의 시험 기록에 PASS가 있다”**는 범위로 읽어야 한다.

Node-RED 검증 범위는 정확한 이미지 안에서 Node.js 프로세스로 라이브러리를 호출한 수준이다. 실제 Node-RED Flow 배포 성공과 구분한다. CTR은 외부 영속 counter provider가 필요하며, 이 API 시험이 운영상 counter 유일성을 입증하지 않는다.

## 2. 전달 결과는 시험 결과와 별개

사용자 제공 메일은 모듈 전달·수령 및 이후 적용·시험 예정까지를 보여준다. 협력사 측 적용 성공·운영 결과·수용 통과 기록은 제공되지 않았다.

메일에 날짜·첨부파일 해시가 없어 수령 파일과 보관된 0.1.0 후보 압축파일의 바이트 일치도 확인하지 못했다. 같은 파일명과 버전만으로 같은 revision으로 취급하지 않는다.

## 3. 지금 공개 저장소에서 재현하는 검사

~~~bash
python3 tools/run_checks.py
~~~

| 검사 | 직접 확인하는 범위 |
|---|---|
| 공개 자료·출처 검사 | 선별 파일 목록, 복사 파일 SHA-256, JSON 메타데이터, Markdown 내부 링크, 기본 민감 패턴 |
| Node 구문·계약 시험 | 입력 형식·keyId 경계값·context 종료 규칙과 호출 예제의 실패 시 정리 |
| C 헤더 검사 | 공개 C 헤더와 ABI 호출 선언의 C99 문법·경고 검사 |
| Java 컴파일 | 공개 Java API와 호출 예제의 Java 8 class-file 대상 컴파일 |

Node 시험은 암호 연산을 항상 거부하는 테스트 더블을 명시적으로 주입한다. 실제 native 라이브러리가 없는 상황을 성공한 암복호화로 대체하지 않는다. 이 검사는 ARIA 정확성·JNI 로딩·N-API 바이너리 호환성·Kafka 연동·대상 컨테이너 실행·운영 보안을 검증하지 않는다.

로컬 검사의 실행환경과 결과는 [portfolio_checks.json](../evidence/portfolio_checks.json)에 기록한다. 이 기록의 시점은 기존 배포 시험 문서 시점과 별개다. GitHub Actions도 같은 공개 검사만 수행한다.

## 4. 버전 추적

| 구분 | 식별 기준 |
|---|---|
| 원 프로젝트 참조 HEAD | 26a076605e788d74c917131e9a30ca6504ab8aa2 |
| 보관된 후보의 소스 표기 | fce89ed21201f454896b8c01016f741a845a221d |
| 공개한 기존 인터페이스·어댑터 | [source_manifest.json](../evidence/source_manifest.json)의 파일별 원본 경로·해시 |
| 이번 작성 예제·검사 코드 | 공개 저장소의 새 Git 이력. 과거 납품 코드·개인 수작업 구현으로 표시하지 않음 |

보관된 후보 소스와 참조 HEAD 사이의 추적 변경은 README·배포 압축파일·체크섬이다. 이 사실이 현재 실행환경의 재검증이나 고객이 수령한 첨부파일 revision 확인을 대신하지는 않는다.
