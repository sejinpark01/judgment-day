// app/components/features/auth/SignupForm.tsx
"use client";

import { useAuth } from "@/hooks/useAuth"; 
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

export function SignupForm() {
  const { formData, handleInputChange, handleSignupSubmit, isLoading } = useAuth();

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