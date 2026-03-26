// client/src/components/Navbar.tsx

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes"; // ✅ 다크모드 훅 추가 - Ver. 2026.03.15
import { Bell, X } from "lucide-react"; // 마이페이지 아이콘
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
            // 1. 내 브라우저(로컬 스토리지)에 있는 토큰과 유저 정보 삭제
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setIsLoggedIn(false);
            setUser(null);

            alert('성공적으로 로그아웃 되었습니다.');

            // 2. 카카오 계정 세션 삭제 요청 후 프론트 메인으로 돌아오기 - Ver 2026.03.26
            const KAKAO_CLIENT_ID = "bab66edf10f61b5ad88ce20eca1ab5e1"; // 아까 발급받은 REST API 키
            const LOGOUT_REDIRECT_URI = "http://localhost:3000"; // 1단계에서 카카오에 등록한 돌아올 주소

            window.location.href = `https://kauth.kakao.com/oauth/logout?client_id=${KAKAO_CLIENT_ID}&logout_redirect_uri=${LOGOUT_REDIRECT_URI}`;
        }
    };

    const handleNotiClick = (notiId: number, postId: number | null) => {
        markAsRead(notiId); // 읽음 처리 (DB 업데이트 및 목록에서 제거)
        setIsNotiOpen(false); // 드롭다운 닫기
        if (postId) router.push(`/post/${postId}`); // 해당 글로 이동
    };

    // 🚀 Navbar 전용 소형 등급 뱃지 헬퍼 함수 - Ver 2026.03.25
    const getRoleBadge = (role?: string) => {
        switch (role) {
            case 'MASTER': return <span className="text-[10px] font-extrabold text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/50 px-1.5 py-0.5 rounded shadow-sm border border-amber-200 dark:border-amber-800">👑 MASTER</span>;
            case 'EXPERT': return <span className="text-[10px] font-extrabold text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/50 px-1.5 py-0.5 rounded shadow-sm border border-blue-200 dark:border-blue-800">🎖️ EXPERT</span>;
            default: return <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded shadow-sm border border-slate-200 dark:border-slate-700">🌱 BEGINNER</span>;
        }
    };

    return (
        <header className="w-full bg-white/90 dark:bg-slate-950/90 backdrop-blur-md sticky top-0 z-50 border-b border-slate-200 dark:border-slate-800">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl h-16 flex justify-between items-center">
                {/* 로고 영역 */}
                <Link href="/">
                    <h1 className="text-2xl font-black tracking-tighter text-slate-900 dark:text-white cursor-pointer hover:opacity-80 transition-opacity">
                        ⚖️ 심판의 날
                    </h1>
                </Link>

                {/* 우측 네비게이션 아이템 영역 */}
                <div className="flex items-center gap-4 sm:gap-6">
                    {isLoggedIn ? (
                        <div className="flex items-center gap-3 sm:gap-5">

                            {/* 1. 실시간 알림 종소리 - Ver 2026.03.24 */}
                            <div className="relative">
                                <Button variant="ghost" size="icon" onClick={() => setIsNotiOpen(!isNotiOpen)} className="relative rounded-full hover:bg-slate-100 dark:hover:bg-slate-800">
                                    <Bell className="w-5 h-5 text-slate-700 dark:text-slate-300" />
                                    {notifications.length > 0 && (
                                        <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse ring-2 ring-white dark:ring-slate-950"></span>
                                    )}
                                </Button>

                                {/* 알림 드롭다운 */}
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

                            {/* 🚀 2. 통합된 프로필 영역 (등급 + 닉네임 -> 마이페이지 링크) - Ver 2026.03.24  */}
                            {user?.nickname && (
                                <Link href="/mypage" className="flex items-center gap-2 group px-2 py-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer">
                                    {getRoleBadge(user.role)}
                                    <span className="text-sm font-extrabold text-slate-700 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                        {user.nickname} <span className="font-medium text-slate-500 dark:text-slate-400">님</span>
                                    </span>
                                </Link>
                            )}

                            {/* 🚀 3. 로그아웃 (시선 분산 방지를 위해 심플한 텍스트로 변경) */}
                            <button onClick={handleLogout} className="text-xs font-bold text-slate-400 hover:text-red-500 transition-colors hidden sm:block ml-1">
                                로그아웃
                            </button>
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

                    {/* 4. 액션 버튼 & 유틸리티 묶음 */}
                    <div className="flex items-center gap-3 border-l border-slate-200 dark:border-slate-800 pl-4 sm:pl-6 ml-1">
                        <Link href="/post/create">
                            <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg transition-transform hover:-translate-y-0.5 font-bold h-9 px-4 sm:px-5">
                                🚨 제보하기
                            </Button>
                        </Link>

                        {/* 다크모드 토글 */}
                        {mounted ? (
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                                className="text-xl rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors w-9 h-9"
                            >
                                {theme === "dark" ? "🌞" : "🌙"}
                            </Button>
                        ) : (
                            <div className="w-9 h-9" />
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
}