// hooks/useCreatePost.ts
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
    
    // TODO: 백엔드 API 연동 (POST /api/posts/create)
    console.log("제출된 데이터:", postData);
    
    setTimeout(() => {
      setIsLoading(false);
      alert("등록되었습니다!");
    }, 1000);
  };

  return { postData, handleInputChange, handleCategoryChange, handleSubmit, isLoading };
}