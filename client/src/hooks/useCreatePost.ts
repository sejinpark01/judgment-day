// client/src/hooks/useCreatePost.ts

import { useState } from "react";
// 기술 명세서에서 정의한 IPost 타입을 가져와서 재사용
import { IPost } from "@/types/db";

export function useCreatePost() {

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

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

  // 🚀 파라미터에 sketchUrl 추가 (선택적)
  const handleSubmit = async (e: React.FormEvent, sketchUrl?: string | null) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null); // 요청 전 에러 초기화

    try {
      // 1. 로컬 스토리지에서 JWT 토큰(신분증) 꺼내기
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error("로그인이 필요한 서비스입니다.");
      }

      // 🚀 2. 백엔드로 보낼 payload에 텍스트 데이터와 그림 데이터(Base64) 병합
      const payload = {
        ...postData,
        sketchUrl: sketchUrl || null // 캔버스가 비어있으면 null 전송
      };

      // 3. 백엔드 API 연동 (POST /api/posts)
      const response = await fetch(`${API_BASE_URL}/api/posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` // ✅ 경비원에게 보여줄 신분증 제출!
        },
        body: JSON.stringify(payload), // ✅ 합쳐진 payload 전송
      });

      // 🚀 [추가된 로직] 401 에러일 경우 JSON 파싱 전에 미리 컷! -Ver 2026.03.10
      if (response.status === 401) {
        localStorage.removeItem('token'); // 만료된 가짜 토큰 지우기
        throw new Error("로그인이 만료되었습니다. 다시 로그인해주세요.");
      }

      // 🚀 일반적인 경우 (에러 포함) JSON 파싱 시도
      let data;
      const text = await response.text();
      try {
        data = JSON.parse(text);
      } catch (parseError) {
        data = { message: text || "알 수 없는 서버 오류가 발생했습니다." };
      }

      if (!response.ok) {
        throw new Error(data.message || "게시글 작성에 실패했습니다.");
      }

      // 4. 성공 시 처리
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