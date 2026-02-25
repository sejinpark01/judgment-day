export interface IPost {
  id?: string;
  videoUrl: string;
  category: 'SUDDEN_ACCEL' | 'THREATENING' | 'ETC'; // 프로젝트에 맞는 카테고리 설정
  content: string;
  createdAt?: string;
}