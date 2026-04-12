# myzzic

## 프로젝트 개요

- **목적**: 반려동물을 키우는 데에 도움을 주는 앱
- **프레임워크**: Next.js 16 (App Router) + Capacitor (iOS 래핑)
- **언어**: TypeScript
- **패키지 매니저**: pnpm

## 주요 라이브러리

- **스타일링**: Tailwind CSS v4
- **상태 관리**: 미정
- **API**: 미정
- **폼**: 미정
- **테스트**: 미정

## 개발 명령어

```bash
# 개발 서버
pnpm dev

# 빌드
pnpm build

# 린트
pnpm lint
```

## 프로젝트 구조

```
app/
├── (routes)/     # App Router 페이지
├── components/   # 재사용 UI 컴포넌트
├── hooks/        # 커스텀 훅
├── stores/       # 상태 관리
├── services/     # API 호출
└── utils/        # 유틸 함수
```

## 코드 컨벤션

- 컴포넌트 파일명: PascalCase (`PetCard.tsx`)
- 훅/유틸 파일명: camelCase (`usePet.ts`, `formatDate.ts`)

## 주의사항

- 이 레포지토리 밖의 파일은 수정하지 않는다
- 불필요한 파일 생성 금지, 기존 파일 수정 우선
- 과도한 추상화 금지 — 실제 필요할 때 추상화
- 에러 핸들링은 시스템 경계(API 호출, 사용자 입력)에서만
- 코드 리뷰는 code-reviewer 에이전트에게 위임
