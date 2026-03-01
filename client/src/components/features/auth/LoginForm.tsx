"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth"; 
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

export function LoginForm() {
  const { login, isLoading, error } = useAuth();

  // 1. 폼 데이터 상태를 컴포넌트 내부에서 직접 관리
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  // 2. 입력값 변경 감지 함수
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // 3. 폼 제출 함수
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const isSuccess = await login(formData);
    
    if (isSuccess) {
      alert('로그인 성공!');
      window.location.href = '/'; // 메인 화면으로 이동
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto bg-background text-foreground shadow-md">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">로그인</CardTitle>
        <CardDescription className="text-muted-foreground">
          심판의 날에 오신 것을 환영합니다.
        </CardDescription>
      </CardHeader>
      
      <form onSubmit={handleLoginSubmit}>
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
            {isLoading ? "로그인 중..." : "로그인"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}