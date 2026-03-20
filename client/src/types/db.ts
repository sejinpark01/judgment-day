export interface IPost {
  id?: string;
  videoUrl: string;
  category: 'SUDDEN_ACCEL' | 'DILEMMA_ZONE' | 'JAYWALKING' | 'RECKLESS_DRIVING' | 'SCHOOL_ZONE' | 'NORMAL'; // 프로젝트에 맞는 카테고리 설정
  content: string;
  createdAt?: string;
  sketchUrl?: string;       // ✅ 안전을 위해 스케치 URL 타입도 추가
  isVoteEnabled?: boolean;  // ✅ 신규 추가: 투표 토글 에러 해결!
}