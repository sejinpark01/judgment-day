// app/components/features/auth/LoginForm.tsx
"use client";

// PRD 원칙: 복잡한 로직은 훅으로 분리
import { useAuth } from "@/hooks/useAuth"; 
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

export function LoginForm() {
  const { formData, handleInputChange, handleLoginSubmit, isLoading } = useAuth();

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