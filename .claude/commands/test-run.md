---
allowed-tools: Bash(pnpm test:*), Bash(pnpm run test:*), Bash(npm test:*), Bash(npm run test:*), Bash(yarn test:*), Bash(npx vitest:*), Bash(npx jest:*), Bash(node:*), Read
description: 테스트 실행 후 결과 요약
---

## Context

- package.json test scripts: !`node -e "try{const p=require('./package.json');const s=Object.entries(p.scripts||{}).filter(([k])=>k.includes('test'));console.log(JSON.stringify(Object.fromEntries(s),null,2))}catch(e){console.log('not found')}" 2>/dev/null`

## 실행 절차

### 1. 환경 감지

**패키지 매니저 결정:**
- `pnpm-lock.yaml` 존재 → pnpm
- `yarn.lock` 존재 → yarn
- 나머지 → npm

**테스트 커맨드 결정 (우선순위순):**
1. scripts에 `test:unit` 또는 `test:run` → 해당 커맨드 사용
2. scripts에 `test` → `--watch` 플래그 없는 경우 사용. 있으면 `-- --run` 또는 `--watchAll=false` 추가
3. scripts 없음 → `node_modules/.bin/vitest` 존재 시 `npx vitest run`, `node_modules/.bin/jest` 존재 시 `npx jest --passWithNoTests`
4. 모두 없음 → "테스트 설정이 없음. package.json에 test 스크립트 추가 필요" 출력 후 종료

### 2. 테스트 실행

- 1단계에서 결정한 패키지 매니저 + 커맨드로 실행
- 실패 시에도 결과 캡처를 위해 `|| true` 사용

### 3. 결과 요약

```
## 테스트 결과

**전체**: X개 통과 / Y개 실패 / Z개 스킵
**소요 시간**: Xs

### ✅ 통과
<!-- 실패 없을 때만 표시 -->

### ❌ 실패한 테스트
- **[파일명 > describe > it]**
  - 예상: `expected value`
  - 실제: `received value`
  - 원인 추정: 한 줄 설명

### 권장 조치
<!-- 실패 원인 분석 및 수정 방향. 전체 통과 시 "모든 테스트 통과! 🎉" 출력 -->
```
