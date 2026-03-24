// client/src/app/page.tsx

"use client";

import { useState, useEffect } from "react";
import { usePosts } from "@/hooks/usePosts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

// 🚀 강력해진 유튜브 URL 추출 함수 (Shorts, 모바일 모두 지원)
function extractVideoId(url: string) {
    if (!url) return '';
    const match = url.match(/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    return match ? match[1] : '';
}

// 🎨 카테고리별 예쁜 색상 뱃지를 위한 헬퍼 함수 (6대 카테고리 적용) - Ver 2026.03.15
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

// 👑 등급(Tier)별 예쁜 색상 뱃지 헬퍼 함수 - Ver 2026.03.17
const getRoleBadge = (role: string) => {
    switch (role) {
        case 'MASTER': return <span className="bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-400 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-800 ml-2 shadow-sm">👑 MASTER</span>;
        case 'EXPERT': return <span className="bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-400 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-blue-200 dark:border-blue-800 ml-2 shadow-sm">🎖️ EXPERT</span>;
        case 'BEGINNER':
        default: return <span className="bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-slate-200 dark:border-slate-700 ml-2">🌱 BEGINNER</span>;
    }
};

export default function HomePage() {
    // 🚀 카테고리 및 정렬 상태 추가 - Ver 2026.03.17
    const [category, setCategory] = useState('ALL');
    const [sort, setSort] = useState('latest');

    // 🚀 usePosts에 필터 조건 전달 - Ver 2026.03.17
    const { posts, page, setPage, totalPages, isLoading, error } = usePosts(1, category, sort);

    // 필터나 정렬이 바뀌면 무조건 1페이지로 돌아가도록 설정 - Ver 2026.03.17
    useEffect(() => {
        setPage(1);
    }, [category, sort, setPage]);

    return (
        <div className="container mx-auto p-4 sm:p-6 lg:p-8 max-w-6xl pt-8">

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

            {/* 🚀 수정된 서브 타이틀 및 필터/정렬 UI - Ver 2026.03.17 */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                <h3 className="text-2xl font-bold flex items-center text-slate-900 dark:text-white tracking-tight">
                    🔥 지금 뜨거운 판결 대기소
                </h3>

                <div className="flex flex-row items-center gap-3 w-full sm:w-auto">
                    {/* 카테고리 필터 드롭다운 */}
                    <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg px-3 py-2 text-sm font-semibold shadow-sm focus:ring-2 focus:ring-blue-500 outline-none flex-1 sm:flex-none cursor-pointer"
                    >
                        <option value="ALL">🌐 전체보기</option>
                        <option value="NORMAL">🚗 일반사고</option>
                        <option value="SUDDEN_ACCEL">🚨 급발진/오조작</option>
                        <option value="DILEMMA_ZONE">🚥 딜레마존</option>
                        <option value="JAYWALKING">🚶 무단횡단</option>
                        <option value="RECKLESS_DRIVING">💢 보복/난폭</option>
                        <option value="SCHOOL_ZONE">🚸 스쿨존</option>
                    </select>

                    {/* 최신순/인기순 정렬 토글 */}
                    <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-1 border border-slate-200 dark:border-slate-700 shadow-sm flex-shrink-0">
                        <button
                            onClick={() => setSort('latest')}
                            className={`px-3 py-1.5 text-sm font-bold rounded-md transition-colors ${sort === 'latest' ? 'bg-white dark:bg-slate-600 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'}`}
                        >
                            ✨ 최신
                        </button>
                        <button
                            onClick={() => setSort('popular')}
                            className={`px-3 py-1.5 text-sm font-bold rounded-md transition-colors ${sort === 'popular' ? 'bg-white dark:bg-slate-600 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'}`}
                        >
                            🔥 인기
                        </button>
                    </div>
                </div>
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
                                        {getCategoryBadge(post.category)}
                                        <span className="text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-full">
                                            <span className="mr-1">👁️</span> {post.views}
                                        </span>
                                    </div>

                                    {/* 메인 페이지 첫 줄 "제목 추출" 처리 -  Ver 2026.03.24  */}
                                    
                                    <div className="flex flex-col gap-1">
                                        {/*  첫 줄은 굵은 제목으로 처리 */}
                                        <CardTitle className="text-lg font-bold text-slate-900 dark:text-slate-100 line-clamp-1 leading-snug group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                            {post.content.split('\n')[0]}
                                        </CardTitle>
                                        {/*  두 번째 줄부터는 회색 본문으로 처리 */}
                                        {post.content.split('\n').length > 1 && (
                                            <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-1 mt-1">
                                                {post.content.split('\n').slice(1).join(' ').trim()}
                                            </p>
                                        )}
                                    </div>
                                </CardHeader>

                                {/* 카드 컴포넌트 내부 "닉네임", "등급" 노출 - Ver 2026.03.17 */}
                                <CardContent className="px-5 pb-5 mt-auto">
                                    <div className="flex justify-between items-center pt-4 border-t border-slate-100 dark:border-slate-800/80">
                                        <div className="flex flex-col">
                                            {/* 🚀 작성자 닉네임 추가 */}
                                            <span className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-0.5 flex items-center">
                                                {post.writer?.nickname || "익명의 제보자"}
                                                {post.writer?.role && getRoleBadge(post.writer.role)}
                                            </span>
                                            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                                                {new Date(post.createdAt!).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })}
                                            </span>
                                        </div>
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