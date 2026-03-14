"use client";

import { useState, useEffect } from "react";
import { usePosts } from "@/hooks/usePosts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useTheme } from "next-themes"; // ✅ 다크모드 훅 추가 - Ver. 2026.03.15

// 🚀 강력해진 유튜브 URL 추출 함수 (Shorts, 모바일 모두 지원)
function extractVideoId(url: string) {
    if (!url) return '';
    const match = url.match(/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    return match ? match[1] : '';
}

// 🎨 3. 카테고리별 예쁜 색상 뱃지를 위한 헬퍼 함수 (6대 카테고리 적용) - Ver 2026.03.15
const getCategoryBadge = (category: string) => {
    switch (category) {
        case 'SUDDEN_ACCEL':
            return <span className="bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300 text-xs font-bold px-2.5 py-1 rounded-md shadow-sm border border-red-200 dark:border-red-800">🚨 급발진/오조작</span>;
        case 'DILEMMA_ZONE':
            return <span className="bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300 text-xs font-bold px-2.5 py-1 rounded-md shadow-sm border border-amber-200 dark:border-amber-800">🚥 딜레마존</span>;
        case 'JAYWALKING':
            return <span className="bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-300 text-xs font-bold px-2.5 py-1 rounded-md shadow-sm border border-orange-200 dark:border-orange-800">🚶 무단횡단</span>;
        case 'RECKLESS_DRIVING':
            return <span className="bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300 text-xs font-bold px-2.5 py-1 rounded-md shadow-sm border border-purple-200 dark:border-purple-800">💢 보복/난폭</span>;
        case 'SCHOOL_ZONE':
            return <span className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300 text-xs font-bold px-2.5 py-1 rounded-md shadow-sm border border-emerald-200 dark:border-emerald-800">🚸 스쿨존</span>;
        case 'NORMAL':
        default:
            return <span className="bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300 text-xs font-bold px-2.5 py-1 rounded-md shadow-sm border border-blue-200 dark:border-blue-800">🚗 일반사고</span>;
    }
};

export default function HomePage() {
    const { posts, page, setPage, totalPages, isLoading, error } = usePosts(1);
    // ✅ 다크모드 상태 관리 - Ver 2026.03.15
    const { theme, setTheme } = useTheme();

    // 로그인 상태 관리
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    // 컴포넌트가 켜질 때 로컬 스토리지에 토큰이 있는지 확인
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            setIsLoggedIn(true);
        }
    }, []);

    // 로그아웃 함수
    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setIsLoggedIn(false);
        alert('성공적으로 로그아웃 되었습니다.');
    };

    return (
        <div className="container mx-auto p-4 sm:p-6 lg:p-8 max-w-6xl">

            {/* 네비게이션 바 (헤더 영역 다듬기) */}
            <div className="flex justify-between items-center mb-8 pb-4 border-b border-slate-200 dark:border-slate-800">
                <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                    ⚖️ 심판의 날
                </h1>

                <div className="flex gap-3">
                    {/* 🚀  다크모드 토글 버튼 추가 Ver-2026.03.15 */}
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                        className="text-2xl"
                    >
                        {theme === "dark" ? "🌞" : "🌙"}
                    </Button>

                    {isLoggedIn ? (
                        <Button variant="outline" onClick={handleLogout} className="border-slate-300 dark:border-slate-700">로그아웃</Button>
                    ) : (
                        <Link href="/login">
                            <Button variant="outline" className="border-slate-300 dark:border-slate-700">로그인</Button>
                        </Link>
                    )}
                    <Link href="/post/create">
                        <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-md transition-transform hover:scale-105">
                            블랙박스 제보하기
                        </Button>
                    </Link>
                </div>
            </div>

            {/* 🚀 1. 히어로 배너 (Hero Banner) 추가 */}
            <div className="w-full bg-slate-900 dark:bg-slate-900/40 text-white py-16 px-6 mb-16 rounded-3xl shadow-2xl text-center flex flex-col items-center justify-center bg-gradient-to-br from-slate-800 to-slate-950 relative overflow-hidden border border-slate-800">
                {/* 배경 장식용 패턴 */}
                <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>

                <h2 className="text-4xl md:text-5xl font-black mb-5 tracking-tight z-10 text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400">
                    당신의 과실은 몇 대 몇입니까?
                </h2>
                <p className="text-lg md:text-xl text-slate-300 mb-8 max-w-2xl z-10 font-medium leading-relaxed drop-shadow-md">
                    억울한 교통사고, 더 이상 혼자 고민하지 마세요. <br className="hidden md:block" />
                    수많은 운전자들의 집단지성과 데이터로 과실 비율을 명쾌하게 심판합니다.
                </p>
                <Link href="/post/create">
                    <Button className="z-10 bg-white text-slate-900 hover:bg-slate-100 font-bold py-6 px-8 rounded-full shadow-[0_0_25px_rgba(255,255,255,0.2)] transition-all duration-300 hover:-translate-y-1 text-base md:text-lg">
                        🚨 내 사고 영상 판결 받기
                    </Button>
                </Link>
            </div>

            {/* 서브 타이틀 */}
            <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-bold flex items-center text-slate-900 dark:text-white tracking-tight">
                    🔥 지금 뜨거운 판결 대기소
                </h3>
            </div>

            {/* 로딩 및 에러 처리 */}
            {isLoading && <p className="text-center py-12 font-bold text-slate-500 animate-pulse text-lg">사건 파일들을 불러오는 중입니다... ⏳</p>}
            {error && <p className="text-center text-red-500 py-10 font-semibold">{error}</p>}

            {/* 🚀 2. 카드 그리드 영역 (Hover 효과 적용) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {posts.map((post) => {
                    const videoId = extractVideoId(post.videoUrl); // 영상 ID 추출

                    return (
                        <Link href={`/post/${post.id}`} key={post.id} className="block group">
                            {/* hover:-translate-y-2 와 hover:shadow-2xl 로 부드러운 호버 애니메이션 추가 */}
                            <Card className="h-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 transition-all duration-300 group-hover:-translate-y-2 group-hover:shadow-xl group-hover:border-blue-400/50 dark:group-hover:border-blue-500/50 overflow-hidden flex flex-col rounded-2xl">

                                {/* 썸네일 영역 */}
                                <div className="aspect-video bg-slate-100 dark:bg-slate-800 relative flex items-center justify-center overflow-hidden">
                                    {videoId ? (
                                        <>
                                            <img
                                                src={`https://img.youtube.com/vi/${videoId}/mqdefault.jpg`}
                                                alt="thumbnail"
                                                className="object-cover w-full h-full transform transition-transform duration-500 group-hover:scale-105"
                                            />
                                            {/* 영상 재생 아이콘 오버레이 */}
                                            <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                                                <div className="w-14 h-14 bg-white/90 rounded-full flex items-center justify-center pl-1 shadow-lg transform transition-transform group-hover:scale-110">
                                                    <span className="text-red-600 text-2xl">▶</span>
                                                </div>
                                            </div>
                                        </>
                                    ) : (
                                        <span className="text-6xl transform transition-transform duration-300 group-hover:scale-110 drop-shadow-md">🚘</span>
                                    )}
                                </div>

                                <CardHeader className="pb-2 pt-5 px-5">
                                    <div className="flex justify-between items-center mb-3">
                                        {/* 🚀 적용된 카테고리 뱃지 */}
                                        {getCategoryBadge(post.category)}
                                        <span className="text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-full">
                                            <span className="mr-1">👁️</span> {post.views}
                                        </span>
                                    </div>
                                    <CardTitle className="text-lg font-bold text-slate-900 dark:text-slate-100 line-clamp-2 leading-snug group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                        {post.content}
                                    </CardTitle>
                                </CardHeader>

                                <CardContent className="px-5 pb-5 mt-auto">
                                    <div className="flex justify-between items-center pt-4 border-t border-slate-100 dark:border-slate-800/80">
                                        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                                            {new Date(post.createdAt).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })}
                                        </p>
                                        <span className="text-blue-600 dark:text-blue-400 text-sm font-bold opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all flex items-center">
                                            판결하기 <span className="ml-1">→</span>
                                        </span>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    );
                })}
            </div>

            {/* 페이지네이션 (디자인 개선) */}
            <div className="flex justify-center items-center gap-3 mt-16 pb-8">
                <Button
                    disabled={page === 1}
                    onClick={() => setPage(page - 1)}
                    variant="outline"
                    className="rounded-full px-5 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                    이전
                </Button>
                <span className="px-5 py-2 font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-full min-w-[80px] text-center shadow-sm border border-slate-200 dark:border-slate-700">
                    {page} <span className="text-slate-400 font-normal">/ {totalPages || 1}</span>
                </span>
                <Button
                    disabled={page === totalPages || totalPages === 0}
                    onClick={() => setPage(page + 1)}
                    variant="outline"
                    className="rounded-full px-5 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                    다음
                </Button>
            </div>
        </div>
    );
}