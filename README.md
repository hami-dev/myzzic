# 🐾 myzzic

반려동물을 키우는 데 도움을 주는 모바일 앱.
식품 유통기한 관리, 청소 기록 추적, 다중 반려동물 지원까지 — 반려동물 케어에 필요한 기능을 한 곳에서.

## Screenshots

> 스크린샷 추가 예정

## Features

### 📦 식품 관리
- 카테고리별 식품 등록 및 관리
- 유통기한 자동 추적 (임박 · 경고 · 만료 상태 뱃지)
- 반려동물별 식품 귀속 또는 공유 설정

### 🧹 청소 관리
- 커스텀 캘린더로 청소 기록 한눈에 확인
- 청소 종류별 색상 dot으로 시각적 구분
- 마지막 청소 경과일 표시 (주의/경고 단계)
- 청소 종류 커스텀 등록 (색상, 반려동물 귀속)

### 🐶 다중 반려동물
- 반려동물별 프로필 관리 (이름, 종류, 식별 색상)
- 펫 필터로 기록 전환
- 펫별 식품/청소 데이터 분리 관리

### 🎨 디자인
- Glassmorphism 기반 따뜻한 UI
- 커스텀 디자인 토큰 시스템 (accent, fg, sat, sun)
- 플로팅 하단 내비게이션
- 배경 블롭 장식으로 부드러운 분위기

## Tech Stack

| 분류 | 기술 |
|------|------|
| Framework | Next.js 16 (App Router) |
| Mobile | Capacitor (iOS) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| Storage | LocalStorage |
| Package Manager | pnpm |

## Project Structure

```
app/
├── (tabs)/              # 탭 기반 메인 페이지
│   ├── page.tsx         # 홈 (대시보드)
│   ├── care/            # 청소 관리
│   ├── food/            # 식품 관리
│   └── settings/        # 설정 · 반려동물 관리
├── components/          # 재사용 UI 컴포넌트
├── context/             # React Context (PetContext)
├── services/            # 데이터 저장소 (localStorage)
├── utils/               # 유틸 함수
└── types.ts             # 타입 정의
```

## Getting Started

```bash
# 의존성 설치
pnpm install

# 개발 서버 실행
pnpm dev

# 빌드
pnpm build
```

## TODO

- [ ] Storage 마이그레이션 (LocalStorage → Supabase)
- [ ] 다크모드 지원
