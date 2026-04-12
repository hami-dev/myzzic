---
allowed-tools: Read, Edit, Glob
description: 함수/컴포넌트/컴포저블에 JSDoc 주석 자동 생성
---

## 실행 절차

### 1. 파일 파악

- 대상 파일 내 함수/컴포넌트/컴포저블 목록 확인
- 기존 주석 스타일 파악 (한국어/영어, 상세도, `/** */` vs `//`)

### 2. 주석 필요 여부 선별

**추가 대상:**
- 파라미터·반환값이 타입만으로 의도 파악 불가한 함수
- 복잡한 비즈니스 로직 포함 함수
- 공개 API 역할의 함수/훅/컴포저블/컴포넌트
- `@throws`, `@example`이 실질적으로 유용한 경우

**추가 제외 대상:**
- 이름과 타입으로 의도가 명확한 함수 (`getUserById(id: string)` 등)
- 단순 getter/setter
- 이미 주석이 충분한 코드
- 1~2줄짜리 자명한 유틸 함수

### 3. 주석 작성

기존 스타일 준수. 기존 스타일 없을 시 아래 형식 사용:

```ts
/**
 * 가격을 한국 원화 형식으로 포매팅함.
 *
 * @param price - 포매팅할 숫자 (음수 허용)
 * @returns '₩10,000' 형태의 문자열
 * @throws {TypeError} price가 숫자가 아닌 경우
 * @example
 * formatPrice(10000)  // '₩10,000'
 * formatPrice(-1000)  // '-₩1,000'
 */
```

### 4. 완료 보고

```
**주석 추가 완료**
- formatPrice — @param, @returns, @throws, @example 추가
- useAuth — @returns (반환 객체 구조 설명) 추가
- getUserById — 자명한 함수이므로 주석 불필요, 생략
```
