// client/src/hooks/useCreatePost.ts

import { useState } from "react";
// 기술 명세서에서 정의한 IPost 타입을 가져와서 재사용
import { IPost } from "@/types/db"; 

export function useCreatePost() {
  const [postData, setPostData] = useState<Partial<IPost>>({
    videoUrl: "",
    category: "SUDDEN_ACCEL", // 기본값
    content: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null); // ✅ 통신 에러를 담을 상태 추가

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setPostData((prev: Partial<IPost>) => ({ ...prev, [name]: value }));
  };

  const handleCategoryChange = (value: string) => {
    // 타입 캐스팅으로 안전하게 상태 업데이트
    setPostData((prev: Partial<IPost>) => ({ ...prev, category: value as IPost['category'] }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null); // 요청 전 에러 초기화
    
    try {
      // 1. 로컬 스토리지에서 JWT 토큰(신분증) 꺼내기
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error("로그인이 필요한 서비스입니다.");
      }

      // 2. 백엔드 API 연동 (POST /api/posts)
      const response = await fetch('http://localhost:4000/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` // ✅ 경비원에게 보여줄 신분증 제출!
        },
        body: JSON.stringify(postData),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || "게시글 작성에 실패했습니다.");
      }
      
      // 3. 성공 시 처리
      alert("성공적으로 등록되었습니다!");
      window.location.href = "/"; // 메인 화면으로 이동
      
    } catch (err: any) {
      console.error("게시글 등록 에러:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return { postData, handleInputChange, handleCategoryChange, handleSubmit, isLoading, error };
}