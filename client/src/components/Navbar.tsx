// client/src/components/Navbar.tsx

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes"; // ✅ 다크모드 훅 추가 - Ver. 2026.03.15
import { UserCircle, Bell, X } from "lucide-react"; // 마이페이지 아이콘

import { useSocketNotification } from "@/hooks/useSocketNotification"; // 🚀 우리가 만든 훅

export function Navbar() {

    // ✅ 다크모드 상태 관리 - Ver 2026.03.15
    const { theme, setTheme } = useTheme();
    const router = useRouter();
    const [mounted, setMounted] = useState(false);
    // 로그인 상태 관리
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    const [user, setUser] = useState<any>(null); // 🚀 로그인한 유저 정보 저장 - Ver 2026.03.24

    // 🚀 알림 드롭다운 상태 - Ver 2026.03.24
    const [isNotiOpen, setIsNotiOpen] = useState(false);

    // 컴포넌트가 켜질 때 로컬 스토리지에 토큰이 있는지 확인 - Ver 2026.03.24
    useEffect(() => {
        setMounted(true);
        const token = localStorage.getItem('token');
        const userStr = localStorage.getItem('user');
        if (token && userStr) {
            setIsLoggedIn(true);
            setUser(JSON.parse(userStr)); // user 객체 파싱 (안에 id가 있음!)
        }
    }, []);

    // 🚀 커스텀 훅으로 실시간 알림 데이터 연결 (user.id를 넘겨서 내 Room에만 입장) - Ver 2026.03.24
    const { notifications, markAsRead } = useSocketNotification(user?.id || null);

    // 로그아웃 함수
    const handleLogout = () => {
        if (confirm('정말로 로그아웃 하시겠습니까?')) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setIsLoggedIn(false);
            setUser(null);
            alert('성공적으로 로그아웃 되었습니다.');
            window.location.href = '/'; // 로그아웃 후 메인으로 강제 이동
        }
    };

    const handleNotiClick = (notiId: number, postId: number | null) => {
        markAsRead(notiId); // 읽음 처리 (DB 업데이트 및 목록에서 제거)
        setIsNotiOpen(false); // 드롭다운 닫기
        if (postId) router.push(`/post/${postId}`); // 해당 글로 이동
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
                    {/* 🚀 로그인/회원가입/로그아웃 동선  - Ver 2026.03.16 */}
                    {isLoggedIn ? (
                        <div className="flex items-center gap-2">

                            {/* 🚀 신규: 실시간 알림 종소리 아이콘 & 드롭다운 - Ver 2026.03.24 */}
                            <div className="relative mr-1">
                                <Button variant="ghost" size="icon" onClick={() => setIsNotiOpen(!isNotiOpen)} className="relative rounded-full hover:bg-slate-100 dark:hover:bg-slate-800">
                                    <Bell className="w-5 h-5 text-slate-700 dark:text-slate-300" />
                                    {/* 안 읽은 알림이 있으면 빨간 불(Red Dot) 핑 찍기 */}
                                    {notifications.length > 0 && (
                                        <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse ring-2 ring-white dark:ring-slate-950"></span>
                                    )}
                                </Button>

                                {/* 알림 드롭다운 패널 */}
                                {isNotiOpen && (
                                    <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl z-50 p-2 overflow-hidden animate-in fade-in slide-in-from-top-2">
                                        <div className="flex justify-between items-center px-3 py-2 border-b border-slate-100 dark:border-slate-700 mb-2">
                                            <span className="font-bold text-sm text-slate-800 dark:text-white">새로운 알림 <span className="text-blue-500">{notifications.length}</span></span>
                                            <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full" onClick={() => setIsNotiOpen(false)}>
                                                <X className="w-4 h-4 text-slate-500" />
                                            </Button>
                                        </div>
                                        <div className="max-h-[300px] overflow-y-auto space-y-1">
                                            {notifications.length === 0 ? (
                                                <p className="text-sm text-center py-6 text-slate-500 dark:text-slate-400 font-medium">새로운 알림이 없습니다.</p>
                                            ) : (
                                                notifications.map(noti => (
                                                    <div
                                                        key={noti.id}
                                                        onClick={() => handleNotiClick(noti.id, noti.postId)}
                                                        className="p-3 text-sm rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer transition-colors flex gap-3 items-start"
                                                    >
                                                        <div className="mt-0.5"><span className="text-xl">{noti.type === 'VOTE' ? '⚖️' : '💬'}</span></div>
                                                        <div>
                                                            <p className="text-slate-800 dark:text-slate-200 font-medium leading-snug">{noti.message}</p>
                                                            <p className="text-[10px] text-slate-400 mt-1 font-semibold">{new Date(noti.createdAt).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}</p>
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>


                            {/*  마이페이지 버튼 */}
                            <Link href="/mypage">
                                <Button variant="ghost" className="font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800">
                                    <UserCircle className="w-5 h-5 mr-1.5" /> 마이페이지
                                </Button>
                            </Link>
                            <Button variant="outline" onClick={handleLogout} className="border-slate-300 dark:border-slate-700 font-semibold hidden sm:flex">
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
                                <Button variant="outline" className="border-slate-300 dark:border-slate-700 font-semibold bg-slate-50 dark:bg-slate-800 hidden sm:flex">
                                    회원가입
                                </Button>
                            </Link>
                        </div>
                    )}

                    <Link href="/post/create">
                        <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-md transition-transform hover:scale-105 ml-2 font-bold">
                            블랙박스 제보하기
                        </Button>
                    </Link>

                    {/* 🚀  다크모드 토글 버튼 (최우측 배치 유지)  Ver-2026.03.15 */}
                    <div className="border-l border-slate-300 dark:border-slate-700 pl-3 ml-1 flex items-center">
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
                    </div>
                </div>
            </div>
        </header >
    );
}