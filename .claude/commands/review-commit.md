---
allowed-tools: Bash(git add:*), Bash(git status:*), Bash(git diff:*), Bash(git commit:*), Bash(git log:*), Agent(code-reviewer)
description: 코드 리뷰 후 문제 없으면 커밋
---

## Context

- Git status: !`git status`
- Changes: !`git diff HEAD`
- Current branch: !`git branch --show-current`
- Recent commits: !`git log --oneline -5`

## 실행 절차

### 1. 코드 리뷰

- `code-reviewer` 에이전트 실행
- 결과 수신 후 다음 단계 진행

### 2. 커밋 여부 결정

code-reviewer 결과의 심각도 기준으로 처리:

| 심각도 | 처리 |
|---|---|
| 🔴 Critical 또는 🟠 High 이슈 있음 | 커밋 중단, 해당 이슈 목록 출력 |
| 🟡 Medium 이하만 있음 | 커밋 진행, 이슈 목록 함께 출력 |
| 이슈 없음 | 커밋 진행 |

### 3. 커밋

- `git log --oneline -5`로 기존 커밋 메시지 언어/스타일 확인
- 동일한 스타일로 변경 내용 간결하게 요약하여 커밋
