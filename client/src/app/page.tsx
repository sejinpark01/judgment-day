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

export default function HomePage() {
    const { posts, page, setPage, totalPages, isLoading, error } = usePosts(1);
    
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
        <div className="container mx-auto p-4 max-w-5xl">
            {/* 🚀 상단 헤더 영역 (로그인/로그아웃 버튼 추가) */}
            <div className="flex justify-between items-center mb-8 pb-4 border-b">
                <h1 className="text-3xl font-bold">🚨 실시간 사건 목록</h1>
                <div className="flex gap-4">
                    {isLoggedIn ? (
                        <Button variant="outline" onClick={handleLogout}>로그아웃</Button>
                    ) : (
                        <Link href="/login">
                            <Button variant="outline">로그인</Button>
                        </Link>
                    )}
                    <Link href="/post/create">
                        <Button>블랙박스 제보하기</Button>
                    </Link>
                </div>
            </div>

            {/* 로딩 및 에러 처리 */}
            {isLoading && <p className="text-center py-10 font-bold">사건 파일들을 불러오는 중...</p>}
            {error && <p className="text-center text-red-500 py-10">{error}</p>}

            {/* 카드 그리드 영역 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {posts.map((post) => {
                    const videoId = extractVideoId(post.videoUrl); // 영상 ID 추출
                    
                    return (
                        <Link href={`/post/${post.id}`} key={post.id}>
                            <Card className="hover:border-primary transition-all cursor-pointer h-full bg-card shadow-sm hover:shadow-md">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-lg truncate">{post.content}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm font-semibold text-muted-foreground mb-3 border bg-muted w-max px-2 py-1 rounded">
                                        유형: {post.category}
                                    </p>
                                    
                                    {/* 🚀 썸네일 영역 (에러 방어 로직 추가) */}
                                    <div className="aspect-video bg-muted rounded-md overflow-hidden relative border flex items-center justify-center">
                                        {videoId ? (
                                            <>
                                                <img 
                                                    src={`https://img.youtube.com/vi/${videoId}/mqdefault.jpg`} 
                                                    alt="thumbnail" 
                                                    className="object-cover w-full h-full" 
                                                />
                                                <div className="absolute inset-0 bg-black/20 hover:bg-transparent transition-all flex items-center justify-center">
                                                    <span className="text-white text-3xl opacity-80 hover:opacity-100">▶</span>
                                                </div>
                                            </>
                                        ) : (
                                            <p className="text-gray-400 text-sm">썸네일 없음</p>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    );
                })}
            </div>

            {/* 페이지네이션 (Pagination) */}
            <div className="flex justify-center gap-4 mt-10">
                <Button disabled={page === 1} onClick={() => setPage(page - 1)} variant="outline">이전</Button>
                <span className="flex items-center font-medium bg-muted px-4 rounded">{page} / {totalPages || 1}</span>
                <Button disabled={page === totalPages || totalPages === 0} onClick={() => setPage(page + 1)} variant="outline">다음</Button>
            </div>
        </div>
    );
}