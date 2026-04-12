---
allowed-tools: Bash(git status:*), Bash(git log:*), Bash(git push:*), Bash(git branch:*), Bash(git rev-parse:*), Bash(gh pr create:*), Bash(gh pr view:*), Bash(gh pr list:*)
description: 커밋된 변경사항을 푸시하고 PR 생성
---

## Context

- Git status: !`git status --short`
- Commits to push: !`git log --oneline @{u}..HEAD 2>/dev/null || git log --oneline -5`
- Current branch: !`git branch --show-current`

## 실행 절차

> `/review-commit` 완료 후 실행

### 1. 상태 확인

| 상태 | 처리 |
|---|---|
| 미커밋 변경사항 있음 | "`/review-commit`을 먼저 실행하세요" 출력 후 종료 |
| 푸시할 커밋 없음 | "푸시할 커밋이 없음" 출력 후 종료 |
| 정상 | 2단계 진행 |

### 2. 푸시

```bash
# 현재 브랜치를 원격에 푸시 (upstream 자동 설정)
git push -u origin HEAD
```

### 3. PR 생성

**base 브랜치 감지:**
```bash
# 원격 기본 브랜치 확인
git remote show origin 2>/dev/null | grep 'HEAD branch' | awk '{print $NF}'
# 실패 시 fallback: main → master 순서로 존재 여부 확인
```

`gh pr create`로 PR 생성. 작성 규칙:

- `--base` 옵션에 감지된 base 브랜치 명시
- `.github/PULL_REQUEST_TEMPLATE.md` 존재 시 → 해당 형식에 맞게 내용 작성
- 미존재 시 → Summary / Test plan 기본 구조 사용
- 제목: 최근 커밋 메시지 기반, 70자 이내
- body: heredoc으로 전달 (`--body "$(cat <<'EOF' ... EOF)"`)
- 완료 후 PR URL 출력
