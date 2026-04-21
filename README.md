# 🐹 myzzic

저는 햄스터와 같이 살고 있어요. 

사둔 줄 모르고 또 사버린 간식, 유통기한이 지나버려서 버리는 사료... <br/>
그리고 퀘스트를 언제 했는지 헷갈려서 캘린더 앱에 따로 기록을 하고 있었답니다.<br/>
(* 일일퀘스트: 눈에 보이는 곳 청소, 주간퀘스트: 쳇바퀴 및 가구 세척, 월간퀘스트: 베딩 청소 등)

집사가 자기가 쓰려고 만든 myzzic

## Screenshots

| 청소 | 식품 |
|--|--|
| <img width="360" height="807" alt="스크린샷 2026-04-22 오전 12 19 51" src="https://github.com/user-attachments/assets/20b1e724-bcd7-43f1-b5bc-0278cbfc4ff6" />  |  <img width="360" height="807" alt="스크린샷 2026-04-22 오전 12 20 49" src="https://github.com/user-attachments/assets/1eda27f4-ea3f-46a4-a612-607a30020313" /> |




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
