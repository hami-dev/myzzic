---
allowed-tools: Read, Glob, Agent(test-writer)
description: 현재 파일 또는 지정한 파일의 단위 테스트 작성
---

## Context

- 프로젝트 의존성: !`cat package.json 2>/dev/null | node -e "const d=JSON.parse(require('fs').readFileSync('/dev/stdin','utf8'));console.log(JSON.stringify({...d.dependencies,...d.devDependencies},null,2))" 2>/dev/null || echo "not found"`
- 기존 테스트 파일: !`find . -not -path '*/node_modules/*' \( -name '*.test.*' -o -name '*.spec.*' \) 2>/dev/null | head -10`

## 실행 절차

### 1. 테스트 대상 결정

우선순위:
1. 사용자가 명시한 파일 또는 함수명
2. 현재 대화에서 방금 작성/수정된 파일
3. 불명확 시 → "어떤 파일을 테스트할까요?" 출력 후 대기

### 2. test-writer 에이전트 실행

전달 정보:
- 테스트 대상 파일 경로
- 위 Context의 의존성 목록 (테스트 스택 감지용)
- 기존 테스트 파일 목록 (패턴 참고용)

### 3. 완료 후

커버한 케이스 목록 요약 출력
