# ⚖️ 심판의 날 (Judgment Day)
> **"당신의 과실은 몇 대 몇입니까?"**
> 실시간 상호작용과 집단지성을 활용한 교통사고 과실 비율 투표 플랫폼

![Project Status](https://img.shields.io/badge/Status-In%20Progress-orange?style=for-the-badge) ![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)

## 1. Project Overview
- **Goal:** Next.js, Node.js, Socket.io를 활용하여 실시간 상호작용이 가능한 투표 플랫폼 구축
- **Target User:** 객관적인 과실 비율 판단을 원하는 운전자 및 방어 운전 학습자
- **Key Value:**
    - 📊 **Data-Driven:** 직관적인 파이 차트와 통계 데이터 제공
    - ⚡ **Interactive:** Socket.io 기반 실시간 투표 반영
    - 🎨 **User Experience:** Tailwind CSS + shadcn/ui 기반 다크모드 UI

## 2. Tech Stack & Architecture
| Category | Technology |
|---|---|
|Data Management| **MySQL** (Relational), **Redis** (Caching)|
| Backend | **Node.js** (Express), **Socket.io** (WebSocket) |
| Frontend | **TypeScript**, **Next.js** (App Router), React |
| Styling | **Tailwind CSS**, shadcn/ui, Lucide Icons |
| DevOps | AWS EC2 (Planned), Github Actions |

## 3. Core Features (MVP)

### A. 🗳️ 실시간 투표 대시보드
- **User Story:** "투표하자마자 다른 사람들의 의견이 그래프에 반영되는 것을 보고 싶다."
- **Tech Spec:**
    - `socket.emit('vote')` → 서버 집계 → `socket.broadcast.emit`
    - Chart.js/Recharts를 활용한 실시간 데이터 시각화

### B. 🎬 프레임 단위 영상 제어기
- **User Story:** "사고 순간을 0.1초 단위로 끊어서 보며 판단하고 싶다."
- **Tech Spec:**
    - YouTube Iframe API + `useRef` 커스텀 컨트롤러 구현 (0.1초 seek)

### C. 🎨 사고 현장 스케치북
- **User Story:** "사고 당시 상황을 그림으로 그려서 설명하고 싶다."
- **Tech Spec:**
    - HTML5 Canvas API (`getContext('2d')`) 활용
    - 드래그 앤 드롭 차량 배치 및 `toDataURL()` 이미지 저장

### D. 🔥 데이터 캐싱 & 랭킹
- **User Story:** "인기 영상을 기다림 없이 보고 싶다."
- **Tech Spec:**
    - Redis를 활용한 조회수 Top 10 게시글 캐싱 (TTL 10분)

## 4. Coding Rules & Guidelines
### General Principles
- **KISS:** 과도한 추상화 지양, 명확한 코드 작성
- **DRY:** 반복 로직은 `hooks/`, `utils/`로 분리
- **Strict Types:** `any` 사용 지양, 명확한 Interface 정의

### Convention
- **Components:** `PascalCase` (e.g., `VoteChart.tsx`)
- **Functions:** `camelCase` (e.g., `handleVoteSubmit`)
- **Constants:** `UPPER_SNAKE_CASE` (e.g., `MAX_VOTE_COUNT`)

## 5. Exception Handling (Edge Cases)
| 상황 | 대응 전략 |
|---|---|
| **YouTube 영상 삭제** | Player API `onError` 감지 → 대체 이미지(Placeholder) 표시 |
| **Socket 연결 끊김** | 클라이언트 `reconnect` 활성화 + 투표 버튼 비활성화(Disabled) |
| **비로그인 투표 시도** | 슬라이더 조작 시 로그인 모달 호출 + 게시글 상태 유지 |

## 6. Development Roadmap
- [x] **Phase 1:** 초기 세팅 & DB 설계 (Current)
- [ ] **Phase 2:** 회원가입/로그인 (Passport.js)
- [ ] **Phase 3:** 영상 제어 & 실시간 투표 (Socket.io)
- [ ] **Phase 4:** 캔버스 드로잉 & Redis 캐싱
- [ ] **Phase 5:** 배포 및 최적화


## **7. 📂 File structure -** Ver 1.1.0

**주요 특징:** **Monorepo Structure**: 프론트엔드와 백엔드가 분리된 구조 확립.

- **UI/Logic Separation**: 커스텀 훅을 통한 관심사 분리(SoC) 적용.
- **Modern Stack Integration**: Next.js App Router와 shadcn/ui, Prisma 환경 구축 완료.

```text
my-traffic-judge/                     # 프로젝트 최상위 루트 폴더
├── package.json                      # [Root] concurrently 실행 스크립트 (프론트/백엔드 동시 실행)
├── node_modules/                     # [Root] 의존성 모듈
│
├── client/                           # 💻 [Frontend] Next.js 앱 라우터 기반 클라이언트 영역
│   ├── package.json                  # 프론트엔드 패키지 관리
│   └── src/
│       ├── app/                      # Next.js App Router 핵심 (폴더명이 곧 URL 라우팅 주소)
│       │   ├── favicon.ico
│       │   ├── globals.css           # 프로젝트 전역 스타일 (Tailwind CSS 적용)
│       │   ├── layout.tsx            # 프로젝트 전체를 감싸는 뼈대 컴포넌트
│       │   ├── page.tsx              # 메인 홈 화면 (백엔드 API 호출 테스트 진입점)
│       │   ├── login/
│       │   │   └── page.tsx          # 로그인 페이지 (/login) 라우팅 껍데기
│       │   ├── post/
│       │   │   └── create/
│       │   │       └── page.tsx      # 게시글 작성 페이지 (/post/create) 라우팅 껍데기
│       │   └── signup/
│       │       └── page.tsx          # 회원가입 페이지 (/signup) 라우팅 껍데기
│       │
│       ├── components/               # 재사용 가능한 UI 블록 모음
│       │   ├── features/             # 특정 도메인 로직을 위해 조립된 복합 UI 폼
│       │   │   ├── auth/
│       │   │   │   ├── LoginForm.tsx       #이메일/비밀번호 입력을 받는 UI
│       │   │   │   └── SignupForm.tsx    #이메일/닉네임/비밀번호 입력을 받는 UI
│       │   │   └── post/
│       │   │       └── CreatePostForm.tsx    #유튜브 URL, 사고 카테고리, 상황 설명을 입력받는 폼 UI
│       │   └── ui/                   # shadcn/ui 기반 순수 디자인 컴포넌트 (가장 작은 레고 블록)
│       │       ├── button.tsx
│       │       ├── card.tsx
│       │       ├── input.tsx
│       │       ├── label.tsx
│       │       ├── select.tsx
│       │       ├── slider.tsx
│       │       └── textarea.tsx
│       │
│       ├── hooks/                    # UI(뷰)와 비즈니스 로직(두뇌)을 분리하는 커스텀 훅 모음
│       │   ├── useAuth.ts            # 로그인/회원가입 상태 및 제출 이벤트 통제
│       │   └── useCreatePost.ts      # 게시글 작성 상태 및 데이터 전송 로직
│       │
│       ├── lib/                      # 프로젝트 전반에서 공통으로 쓰이는 유틸리티
│       │   └── utils.ts              # Tailwind 클래스 병합 등 유틸 함수
│       │
│       └── types/                    # 타입스크립트 인터페이스/데이터 모델 정의 (강력한 타입 체크)
│           └── db.ts
│
└── server/
    ├── package.json
    ├── tsconfig.json
    ├── .env                       # DATABASE_URL이 정의된 곳
    ├── prisma/
    │   └── schema.prisma          # url = env("DATABASE_URL") 포함
    ├── src/
    │   ├── index.ts               # 서버 진입점
    │   ├── lib/
    │   │   └── prisma.ts          # ✅ 새로 생성 (Prisma 인스턴스 관리)
    │   └── routes/
    │       └── auth.ts            # prisma 인스턴스를 불러와 사용
    └── node_modules/