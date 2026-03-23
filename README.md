# ⚖️ 심판의 날 (Judgment Day)
> **"당신의 과실은 몇 대 몇입니까?"**
> 실시간 상호작용과 집단지성을 활용한 교통사고 과실 비율 투표 플랫폼

![Project Status](https://img.shields.io/badge/Status-In%20Progress-orange?style=for-the-badge) ![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)

## 1. Project Overview
- **Goal:** Next.js, Node.js, Socket.io를 활용하여 실시간 상호작용이 가능한 투표 플랫폼 구축
- **Target User:** 객관적인 과실 비율 판단을 원하는 운전자 및 방어 운전 학습자
- **Key Value:**
    - 📊 **Data-Driven & Visualization:** 직관적인 파이 차트 제공 및 유저 투표 편차 데이터를 활용한 '운전 MBTI' 시각화
    - ⚡ **Interactive & Real-time:** Socket.io 기반 실시간 투표 반영 및 1:1 타겟팅 실시간 알림(Notification) 시스템
    - 🎨 **User Experience:** Tailwind CSS + shadcn/ui 기반 다크모드 UI 및 관심사 분리(SoC) 패턴 적용

## 2. Tech Stack & Architecture
| Category | Technology |
|---|---|
|Data Management| **MySQL** (Relational), **Prisma** (ORM), **Redis** (Caching)|
| Backend | **Node.js** (Express), **TypeScript**, **Socket.io** (WebSocket & Real-time), http |
| Frontend | **Next.js** (App Router), **TypeScript**, React(React Hooks), **Recharts/Chart.js** (Data Visualization), Fetch API |
| Auth | **Passport.js** (JWT Strategy), bcrypt, CORS |
| Styling | **Tailwind CSS**, shadcn/ui, Lucide Icons |
| Core APIs | YouTube Iframe API (seekTo, getCurrentTime, playVideo), HTML5 Canvas API (getContext('2d')) |
| Libraries | react-youtube, lucide-react , next-themes |
| DevOps & Infra | **Docker (Redis Container)**, AWS EC2 (Planned), Github Actions |

## 3. Core Features (MVP)

### A. 🗳️ 실시간 투표 대시보드
- **User Story:** "투표하자마자 다른 사람들의 의견이 그래프에 반영되는 것을 보고 싶다."
- **Tech Spec:**
    - 데이터 무결성을 위한 REST + Socket 하이브리드 아키텍처 적용
    - `REST API(POST)`로 안전하게 DB 저장 및 JWT 검증 → `서버 집계` → `socket.to().emit()` 브로드캐스팅
    - CSS transition 기반 부드러운 양방향 프로그레스 바 렌더링

### B. 🎬 프레임 단위 영상 제어기
- **User Story:** "사고 순간을 0.1초 단위로 끊어서 보며 판단하고 싶다."
- **Tech Spec:**
    - YouTube Iframe API + `useRef` 커스텀 컨트롤러 구현 (0.1초 seek)

### C. 🎨 사고 현장 스케치북
- **User Story:** "사고 당시 상황을 그림으로 그려서 설명하고 싶다."
- **Tech Spec:**
    - HTML5 Canvas API (`getContext('2d')`) 활용
    - 드래그 앤 드롭 차량 배치 및 `toDataURL()` 이미지 저장

### D. 🔥 데이터 캐싱 (Redis)
- **User Story:** "메인 페이지의 게시글 목록을 기다림 없이 바로 보고 싶다."
- **Tech Spec:**
    - Redis를 활용한 메인 페이지 게시글 리스트 캐싱 (TTL 60초 적용으로 DB 부하 감소)

### E. 👑 운전자 등급(Tier) 시스템
- **User Story:** "내 투표 활동이 누적될수록 전문가로 인정받고 싶다."
- **Tech Spec:**
    - 투표 참여도에 따른 자동 승급 로직 (BEGINNER -> EXPERT -> MASTER)

### F. 🌗 다크모드 및 UI/UX 폴리싱
- **User Story:** "밤에 사고 영상을 볼 때 눈이 부시지 않고, 서비스가 세련되었으면 좋겠다."
- **Tech Spec:**
    - `next-themes`와 `Tailwind CSS`을 기반으로 개발한, 전역 다크모드 및 반응형 카드 호버 애니메이션

### G: 📊 나의 판결 성향 분석 (운전 MBTI)    
- **User Story:** "나는 단순히 투표 기록을 보는 것을 넘어, 남들과 비교했을 때 내 과실 판단 성향이 얼마나 객관적인지(혹은 편향되었는지) 분석된 시각화 데이터를 보고 싶다." 
- **Tech Spec:**
 - **Backend (Prisma & Node.js):**
    - 유저가 투표를 제출할 때마다 해당 게시글의 현재 평균 과실 비율과 유저의 투표 비율 차이를 계산하여 `UserDeviation` 테이블(또는 `User` 테이블의 누적 필드)에 업데이트.
    - Prisma의 `aggregate` 쿼리를 활용해 특정 유저의 평균 편차값 추출 API 구현.
 - **Frontend (Next.js & Chart.js / Recharts):**
    - 마이페이지 로드 시 API를 호출하여 편차 데이터를 수신.
    - 수신된 데이터를 기반으로 방사형 차트(Radar Chart) 또는 양방향 막대그래프(Bar Chart) 렌더링.
    - 도출된 MBTI 유형에 따른 재미있는 칭호 배지(Badge) UI 제공.

### H: 🔔 내 활동 실시간 알림 (Notification)  
- **User Story:** "나는 내가 올린 블랙박스 영상에 누군가 새로운 투표를 하거나 원인 분석 댓글을 달았을 때, 새로고침 없이 즉각적으로 알림을 받고 싶다."
- **Tech Spec:**
 - **Backend (Socket.io & Redis & Prisma):**
    - 유저가 로그인하면 자신의 `user_id`를 기반으로 한 고유 Socket Room(예: `room_user_123`)에 `join`.
    - 타 유저가 투표(`Vote`)하거나 댓글(`Comment`)을 생성(POST)하는 순간, 게시글 작성자의 고유 Room으로 `emit('new_notification')` 전송.
    - 사용자가 오프라인일 때 발생한 알림을 유실하지 않기 위해, 알림 내역을 DB(`Notification` 테이블)에 저장하거나 Redis List 자료구조를 활용해 임시 캐싱.
 - **Frontend (Next.js & Tailwind CSS):**
    - 전역 레이아웃(`Navbar.tsx`)에서 커스텀 훅(`useSocketNotification`)을 통해 알림 이벤트 리스닝.
    - 알림 수신 시 종소리(🔔) 아이콘에 Red Dot(배지) 활성화 및 토스트(Toast) 팝업 제공.
    - 알림 클릭 시 해당 게시글 상세 페이지로 라우팅 처리.

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
| **외부 기기/모바일 접속(CORS) 에러** | Express CORS 미들웨어 origin 도메인 허용 및 네트워크 바인딩(0.0.0.0) 처리 |

## 6. Development Roadmap
- [x] **Phase 1:** 초기 세팅 & DB 설계
- [x] **Phase 2:** 회원가입/로그인 (Passport.js)
- [x] **Phase 3:** 영상 제어 & 실시간 투표 (Socket.io)
- [x] **Phase 4:** 캔버스 드로잉 & Redis 캐싱 & 운전자 등급(Tier) 시스템
- [x] **Phase 5: Polish & UI/UX** (히어로 배너, 카드 호버, 카테고리 뱃지, 다크모드 시스템 구축)
- [ ] **Phase 6: Feature Enhancement & Deploy**
    - **인터페이스 최적화:** UI 플로팅(Sticky) 적용 및 쇼츠 영상 뷰 최적화
    - **UX 고도화:** 메인 페이지 카테고리(6대 사고 유형) 필터링 및 정렬(최신/인기순) 추가
    - **데이터 동기화:** 실시간 조회수 및 작성자 닉네임(User.nickname) 연동
    - **커뮤니티 기능:** 게시글 수정/삭제, 댓글 시스템, 투표 토글 옵션, 마이 페이지 구현
    - **나의 판결 성향 분석 (운전 MBTI):** 사용자 투표 데이터를 대중 평균 투표율과 비교·분석하여 방사형 차트(Radar Chart)로 시각화하고 맞춤형 칭호 부여.
    - **1:1 실시간 활동 알림:** Socket.io 고유 Room을 활용한 타겟팅 통신으로, 내 게시글의 새로운 반응(투표/댓글)을 새로고침 없이 즉각적으로 수신.
    - **특화 기능:** AI 판사(my-traffic-judge) 연동
    - **인프라 및 보안:** OAuth 소셜 로그인, Redis Rate Limit 보안 강화, CI/CD 배포
    
    

## **7. 📂 File structure -** Ver 1.9.1

**주요 특징:** **Monorepo Structure**: 프론트엔드와 백엔드가 분리된 구조 확립.

- **UI/Logic Separation**: 커스텀 훅을 통한 관심사 분리(SoC) 적용 및 전역 레이아웃 컴포넌트 분리.
- **Modern Stack Integration**: Next.js App Router와 shadcn/ui, Prisma 환경 구축 완료.
- **Custom Player Integration**: react-youtube 기반 고정밀 프레임 제어 컨트롤러(VideoPlayer) 컴포넌트 분리 및 적용 완료.
- **Interactive Components**: 고정밀 컨트롤러(VideoPlayer) 및 실시간 비율 조정(VoteSlider), 캔버스 드로잉(AccidentSketchbook), 사고 분석 토론(CommentSection) 등 도메인 특화 인터페이스 구현 완료.
- **Performance Optimization**: Redis를 활용한 인메모리 캐싱 레이어 구축으로 조회 성능 극대화.
- **Dark Mode Integration**: next-themes를 활용한 전역 테마 관리 시스템 도입.

```text
my-traffic-judge/                     # 프로젝트 최상위 루트 폴더
├── package.json                      # [Root] concurrently 실행 스크립트 (프론트/백엔드 동시 실행)
├── node_modules/                     # [Root] 의존성 모듈
│
├── client/                           # 💻 [Frontend] Next.js 앱 라우터 기반 클라이언트 영역
│   ├── .env.local                    # 클라이언트 환경변수 (NEXT_PUBLIC_API_URL 등)
│   ├── package.json                  # 프론트엔드 패키지 관리
│   └── src/
│       ├── app/                      # Next.js App Router 핵심 (폴더명이 곧 URL 라우팅 주소)
│       │   ├── favicon.ico
│       │   ├── globals.css           # 프로젝트 전역 스타일 (Tailwind CSS 적용)
│       │   ├── layout.tsx            # 프로젝트 전체를 감싸는 뼈대 컴포넌트
│       │   ├── page.tsx              # 메인 홈 화면 (게시글 리스트 및 페이지네이션 연동)
│       │   ├── login/
│       │   │   └── page.tsx          # 로그인 페이지 (/login) 라우팅 껍데기
│       │   ├── mypage/               # 🌟 (신규) 마이페이지 도메인
│       │   │   └── page.tsx          # 내 투표 기록, 등급 시각화, 비밀번호 변경 화면
│       │   ├── post/
│       │   │   ├── create/
│       │   │   │   └── page.tsx      # 게시글 작성 페이지 (/post/create) 라우팅 껍데기
│       │   │   └── [id]/
│       │   │       ├── page.tsx      # 게시글 상세 페이지 (VideoPlayer 및 VoteSlider 연동)
│       │   │       └── edit/         # 게시글 수정 도메인
│       │   │           └── page.tsx  # 게시글 수정 전용 폼 페이지 (/post/[id]/edit)
│       │   └── signup/
│       │       └── page.tsx          # 회원가입 페이지 (/signup) 라우팅 껍데기
│       │
│       ├── components/               # 재사용 가능한 UI 블록 모음
│       │   ├── Navbar.tsx            # 🌟 (신규) 다크모드 및 로그인 상태를 관리하는 전역 헤더
│       │   ├── ThemeProvider.tsx     # 다크모드 전역 상태 공급자
│       │   ├── features/             # 특정 도메인 로직을 위해 조립된 복합 UI 폼
│       │   │   ├── auth/
│       │   │   │   ├── LoginForm.tsx       # 이메일/비밀번호 입력을 받는 UI
│       │   │   │   └── SignupForm.tsx      # 이메일/닉네임/비밀번호 입력을 받는 UI
│       │   │   └── post/
│       │   │       ├── AccidentSketchbook.tsx # Canvas API 기반 드로잉 툴
│       │   │       ├── CommentSection.tsx  # 사고 원인 분석 댓글 컴포넌트
│       │   │       ├── CreatePostForm.tsx  # 유튜브 URL, 사고 카테고리, 상황 설명을 입력받는 폼 UI
│       │   │       ├── VideoPlayer.tsx     # 0.1초 단위 제어 및 타이머를 갖춘 커스텀 플레이어
│       │   │       └── VoteSlider.tsx      # 투표 슬라이더 인터페이스
│       │   └── ui/                   # shadcn/ui 기반 순수 디자인 컴포넌트
│       │       ├── button.tsx, card.tsx, input.tsx, label.tsx, select.tsx, slider.tsx, textarea.tsx
│       │
│       ├── hooks/                    # UI(뷰)와 비즈니스 로직(두뇌)을 분리하는 커스텀 훅 모음
│       │   ├── useAuth.ts            # 로그인/회원가입 상태 및 제출 이벤트 통제
│       │   ├── useCreatePost.ts      # 게시글 작성 상태 및 데이터 전송 로직
│       │   ├── usePosts.ts           # 메인 페이지 게시글 목록 조회 로직
│       │   └── usePostDetail.ts      # 상세 페이지 단일 게시글 조회 로직
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
│   └── schema.prisma          # url = env("DATABASE_URL") 포함 (Comment 모델 추가)
├── src/
│   ├── index.ts               # 서버 진입점
│   ├── lib/
│   │   ├── prisma.ts          # Prisma 인스턴스 관리
│   │   └── redis.ts           # Redis 클라이언트 연결 모듈
│   ├── middlewares/
│   │   └── passport.ts        # Passport JWT 인증 전략 및 경비원 역할
│   └── routes/
│       ├── auth.ts            # 회원가입, 로그인, 🌟(신규) 프로필 조회 및 PW 변경 라우터
│       └── post.ts            # 게시글 및 댓글(Comment) CRUD API 라우터 (Passport, Redis 적용)
└── node_modules/