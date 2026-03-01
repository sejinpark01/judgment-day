"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth"; 
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

export function SignupForm() {
  const { signup, isLoading, error } = useAuth();

  // 1. 회원가입용 폼 데이터 상태 (nickname 포함)
  const [formData, setFormData] = useState({
    email: "",
    nickname: "",
    password: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const isSuccess = await signup(formData);
    
    if (isSuccess) {
      alert('회원가입 성공! 로그인 페이지로 이동합니다.');
      window.location.href = '/login'; 
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto bg-background text-foreground shadow-md">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">회원가입</CardTitle>
        <CardDescription className="text-muted-foreground">
          심판의 날에 합류하여 판사가 되어보세요.
        </CardDescription>
      </CardHeader>
      
      <form onSubmit={handleSignupSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">이메일</Label>
            <Input 
              id="email" 
              name="email"
              type="email" 
              placeholder="judge@example.com" 
              value={formData.email}
              onChange={handleInputChange}
              required 
              className="bg-muted focus-visible:ring-primary"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="nickname">닉네임</Label>
            <Input 
              id="nickname" 
              name="nickname"
              type="text" 
              placeholder="냉철한판사" 
              value={formData.nickname}
              onChange={handleInputChange}
              required 
              className="bg-muted focus-visible:ring-primary"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">비밀번호</Label>
            <Input 
              id="password" 
              name="password"
              type="password" 
              value={formData.password}
              onChange={handleInputChange}
              required 
              className="bg-muted focus-visible:ring-primary"
            />
          </div>
          {/* 백엔드에서 보낸 에러 메시지가 있으면 화면에 표시 */}
          {error && <p className="text-red-500 text-sm font-medium">{error}</p>}
        </CardContent>
        <CardFooter>
          <Button 
            type="submit" 
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
            disabled={isLoading}
          >
            {isLoading ? "가입 처리 중..." : "회원가입"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}