// hooks/useAuth.ts
import { useState } from "react";

export function useAuth() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    nickname: "", // 회원가입 시 사용
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // 로그인 제출 핸들러
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // TODO: 백엔드 로그인 API 연동 예정 (POST /api/auth/login)
    console.log("로그인 시도:", { email: formData.email, password: formData.password });
    
    setTimeout(() => {
      setIsLoading(false);
      alert("로그인 로직이 곧 연결됩니다!");
    }, 1000);
  };

  // 회원가입 제출 핸들러
  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // TODO: 백엔드 회원가입 API 연동 예정 (POST /api/auth/signup)
    console.log("회원가입 시도:", formData);
    
    setTimeout(() => {
      setIsLoading(false);
      alert("회원가입 로직이 곧 연결됩니다!");
    }, 1000);
  };

  return { 
    formData, 
    handleInputChange, 
    handleLoginSubmit, 
    handleSignupSubmit, 
    isLoading 
  };
}