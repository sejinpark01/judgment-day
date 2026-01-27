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
- [ ] **Phase 1:** 초기 세팅 & DB 설계 (Current)
- [ ] **Phase 2:** 회원가입/로그인 (Passport.js)
- [ ] **Phase 3:** 영상 제어 & 실시간 투표 (Socket.io)
- [ ] **Phase 4:** 캔버스 드로잉 & Redis 캐싱
- [ ] **Phase 5:** 배포 및 최적화
