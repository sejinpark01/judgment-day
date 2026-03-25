// client/src/components/features/auth/LoginForm.tsx

"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation"; // ✅ 라우터 임포트 -Ver 2026.03.16
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import Link from "next/link"; // ✅ Link 임포트 추가 -Ver 2026.03.16

export function LoginForm() {
  const { login, isLoading, error } = useAuth();
  const router = useRouter(); // ✅ 라우터 선언 - Ver 2026.03.16

  // 1. 폼 데이터 상태를 컴포넌트 내부에서 직접 관리
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  // 2. 소셜 로그인 콜백으로 넘어온 URL 쿼리(Token) 파싱 로직 - Ver 2026.03.25
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const token = searchParams.get('token');
    const userStr = searchParams.get('user');

    if (token && userStr) {
      // 로컬 스토리지에 세팅
      localStorage.setItem('token', token);
      localStorage.setItem('user', decodeURIComponent(userStr));
      alert('소셜 로그인에 성공했습니다!');
      window.location.href = '/'; // 강제 새로고침하여 헤더 상태 동기화
    }
  }, []);

  // 3. 입력값 변경 감지 함수
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // 4. 폼 제출 함수
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const isSuccess = await login(formData);

    if (isSuccess) {
      alert('로그인 성공!');
      window.location.href = '/'; // 메인 화면으로 이동
    }
  };

  // 5. 소셜 로그인 호출 핸들러 - Ver 2026.03.25
  const handleSocialLogin = (provider: 'kakao' | 'google') => {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
    window.location.href = `${API_URL}/api/auth/${provider}`;
  };

  return (
    <Card className="w-full max-w-md mx-auto bg-background text-foreground shadow-md">
      <CardHeader className="text-center pb-6 border-b border-border mb-4">
        <CardTitle className="text-2xl font-extrabold text-slate-900 dark:text-white">로그인</CardTitle>
        <CardDescription className="text-slate-500 font-medium">
          심판의 날에 오신 것을 환영합니다.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4 pb-4" >
        {/* 🚀 1. 소셜 로그인 버튼 영역 - Ver 2026.03.25*/}
        <div className="space-y-3 mb-6">
          <Button
            type="button"
            onClick={() => handleSocialLogin('kakao')}
            className="w-full h-11 bg-[#FEE500] hover:bg-[#FEE500]/90 text-black font-bold shadow-sm flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 3c-5.523 0-10 3.52-10 7.865 0 2.802 1.936 5.253 4.887 6.551-.157.545-.568 2.015-.65 2.316-.103.385.127.382.269.29 0 0 2.115-1.42 3.655-2.454.6.082 1.217.126 1.839.126 5.523 0 10-3.52 10-7.865C22 6.52 17.523 3 12 3z" /></svg>
            카카오로 시작하기
          </Button>
          <Button
            type="button"
            onClick={() => handleSocialLogin('google')}
            variant="outline"
            className="w-full h-11 bg-white hover:bg-slate-50 text-slate-700 font-bold border border-slate-300 shadow-sm flex items-center justify-center gap-2 dark:bg-white dark:hover:bg-slate-200 dark:text-slate-900"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" /><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" /><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" /></svg>
            Google로 시작하기
          </Button>
        </div>

        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-slate-200 dark:border-slate-700" /></div>
          <div className="relative flex justify-center text-xs uppercase"><span className="bg-background px-2 text-muted-foreground font-bold">또는 이메일로 로그인</span></div>
        </div>

        {/* 2. 일반 이메일 로그인 영역 */}
        <form onSubmit={handleLoginSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">이메일</Label>
            <Input id="email" name="email" type="email" placeholder="judge@example.com" value={formData.email} onChange={handleInputChange} required className="bg-muted focus-visible:ring-primary" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">비밀번호</Label>
            <Input id="password" name="password" type="password" value={formData.password} onChange={handleInputChange} required className="bg-muted focus-visible:ring-primary" />
          </div>

          {error && <p className="text-red-500 text-sm font-medium">{error}</p>}

          <div className="flex justify-end gap-2 w-full pt-2">
            <Button type="button" variant="outline" className="w-20 h-9 border-slate-300 dark:border-slate-700 font-bold text-sm" onClick={() => router.push('/')}>취소</Button>
            <Button type="submit" className="w-24 h-9 bg-slate-900 text-white hover:bg-slate-800 font-bold dark:bg-white dark:text-slate-900 transition-colors text-sm" disabled={isLoading}>
              {isLoading ? "로그인 중..." : "로그인"}
            </Button>
          </div>
        </form>
      </CardContent>

      {/* 🚀 CardFooter 수정: 회원가입 유도 링크 추가  Ver- 2026.03.16 */}
      <CardFooter className="flex flex-col gap-4 border-t border-border pt-6">

        {/* 회원가입 유도 링크 Ver - 2026.03.16 */}
        <div className="text-sm text-center text-slate-500 dark:text-slate-400">
          아직 계정이 없으신가요?{" "}
          <Link href="/signup" className="text-blue-600 hover:underline font-extrabold dark:text-blue-400">
            이메일로 회원가입
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}