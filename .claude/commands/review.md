---
allowed-tools: Bash(git diff:*), Bash(git status:*), Bash(git log:*), Bash(git branch:*), Bash(git merge-base:*), Glob, Read, Agent(code-reviewer)
description: "코드 리뷰 (옵션: changes | staged | branch | all)"
---

## Context

- Current branch: !`git branch --show-current`
- Git status: !`git status --short`

## 실행 방식

인자: `$ARGUMENTS`

아래 표에 따라 리뷰 범위 결정 후 `code-reviewer` 에이전트 실행

| 인자 | 리뷰 범위 |
|---|---|
| `changes` 또는 없음 | unstaged + staged 변경사항 (`git diff HEAD`) |
| `staged` | 스테이징된 변경사항만 (`git diff --cached`) |
| `branch` | 현재 브랜치 전체 변경사항 (base 브랜치 대비) |
| `all` | 프로젝트 전체 코드 |

---

### changes / 인자 없음

```bash
# 커밋되지 않은 전체 변경사항 확인
git diff HEAD
```

변경사항 없을 시 → `git diff HEAD~1 HEAD`로 최근 커밋 리뷰

---

### staged

```bash
# 스테이징된 변경사항만 확인
git diff --cached
```

스테이징된 파일 없을 시 → "스테이징된 변경사항이 없음" 출력 후 종료

---

### branch

```bash
# base 브랜치와의 분기점 SHA 산출
git merge-base HEAD $(git branch -r | grep -E 'origin/(main|master)' | head -1 | xargs)

# 분기점 이후 전체 변경사항 확인
git diff <BASE_SHA>..HEAD
```

base 브랜치 감지 실패 시 → `git log --oneline`으로 분기점 직접 파악

---

### all

1. `src/`, `app/`, `lib/`, `components/` 등 소스 디렉토리 Glob 탐색
2. 파일 수 과다 시 핵심 파일 위주로 범위 축소
3. 리뷰 시작 전 "전체 코드 리뷰 시작. 대상 파일: X개" 안내

---

### 잘못된 인자 입력 시

```
사용법: /review [옵션]

옵션:
  changes   현재 변경사항 (기본값)
  staged    스테이징된 변경사항만
  branch    현재 브랜치 전체 변경사항
  all       프로젝트 전체 코드 리뷰
```
