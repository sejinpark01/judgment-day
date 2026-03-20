// client/src/components/Navbar.tsx

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes"; // ✅ 다크모드 훅 추가 - Ver. 2026.03.15
import { UserCircle } from "lucide-react"; // 마이페이지 아이콘

export function Navbar() {

    // ✅ 다크모드 상태 관리 - Ver 2026.03.15
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
    // 로그인 상태 관리
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    // 컴포넌트가 켜질 때 로컬 스토리지에 토큰이 있는지 확인
    useEffect(() => {
        setMounted(true);
        const token = localStorage.getItem('token');
        if (token) {
            setIsLoggedIn(true);
        }
    }, []);

    // 로그아웃 함수
    const handleLogout = () => {
        if (confirm('정말로 로그아웃 하시겠습니까?')) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setIsLoggedIn(false);
            alert('성공적으로 로그아웃 되었습니다.');
            window.location.href = '/'; // 로그아웃 후 메인으로 강제 이동
        }
    };

    return (
        <header className="w-full bg-white/80 dark:bg-slate-950/80 backdrop-blur-md sticky top-0 z-50 border-b border-slate-200 dark:border-slate-800">
            {/* 네비게이션 바 (헤더 영역 다듬기) */}

            <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl h-16 flex justify-between items-center">
                <Link href="/">
                    <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white cursor-pointer hover:opacity-80 transition-opacity">
                        ⚖️ 심판의 날
                    </h1>
                </Link>
                
                <div className="flex items-center gap-3">
                    {/* 🚀  다크모드 토글 버튼 추가 Ver-2026.03.15 */}
                    {mounted ? (
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                            className="text-xl rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                        >
                            {theme === "dark" ? "🌞" : "🌙"}
                        </Button>
                    ) : (
                        <div className="w-10 h-10" />
                    )}

                    {/* 🚀 수정된 로그인/회원가입/로그아웃 동선  - Ver 2026.03.16 */}
                    {isLoggedIn ? (
                        <div className="flex items-center gap-2">
                            {/* 🚀 신규 추가: 마이페이지 버튼 */}
                            <Link href="/mypage">
                                <Button variant="ghost" className="font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800">
                                    <UserCircle className="w-5 h-5 mr-1.5" /> 마이페이지
                                </Button>
                            </Link>
                            <Button variant="outline" onClick={handleLogout} className="border-slate-300 dark:border-slate-700">
                                로그아웃
                            </Button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2">
                            <Link href="/login">
                                <Button variant="outline" className="border-slate-300 dark:border-slate-700 font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800">
                                    로그인
                                </Button>
                            </Link>
                            <Link href="/signup">
                                <Button variant="outline" className="border-slate-300 dark:border-slate-700 font-semibold bg-slate-50 dark:bg-slate-800">
                                    회원가입
                                </Button>
                            </Link>
                        </div>
                    )}
                    <Link href="/post/create">
                        <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-md transition-transform hover:scale-105 ml-2">
                            블랙박스 제보하기
                        </Button>
                    </Link>
                </div>
            </div>
        </header >
    );
}