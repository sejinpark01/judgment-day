export interface IPost {
  id?: string;
  videoUrl: string;
  category: 'SUDDEN_ACCEL' | 'DILEMMA_ZONE' | 'JAYWALKING' | 'RECKLESS_DRIVING' | 'SCHOOL_ZONE' | 'NORMAL'; // 프로젝트에 맞는 카테고리 설정
  content: string;
  createdAt?: string;
}