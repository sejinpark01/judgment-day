// client/src/hooks/useAuth.ts
import { useState } from 'react';

export const useAuth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 1. 회원가입 요청 함수
  const signup = async (formData: any) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:4000/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || '회원가입에 실패했습니다.');
      
      return true; // 성공 시 true 반환
    } catch (err: any) {
      setError(err.message);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // 2. 로그인 요청 함수
  const login = async (formData: any) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:4000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || '로그인에 실패했습니다.');

      // 🔑 핵심: 백엔드가 준 JWT 토큰을 브라우저 로컬 스토리지에 저장!
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      return true; // 성공 시 true 반환
    } catch (err: any) {
      setError(err.message);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // 3. 로그아웃 함수 (토큰 삭제)
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  return { signup, login, logout, isLoading, error };
};