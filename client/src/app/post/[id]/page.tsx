"use client";

import { useParams } from "next/navigation";
import { usePostDetail } from "@/hooks/usePostDetail";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

// 🚀 강력해진 유튜브 URL 추출 함수
function extractVideoId(url: string) {
    if (!url) return '';
    const match = url.match(/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    return match ? match[1] : '';
}

export default function PostDetailPage() {
    const params = useParams();
    const postId = params.id as string;
    const { post, isLoading, error } = usePostDetail(postId);

    if (isLoading) return <div className="text-center py-20 text-xl">사건 기록을 불러오는 중...</div>;
    if (error) return <div className="text-center text-red-500 py-20">{error}</div>;
    if (!post) return <div className="text-center py-20">게시글이 존재하지 않습니다.</div>;

    const videoId = extractVideoId(post.videoUrl);

    return (
        <div className="container mx-auto p-4 max-w-4xl mt-6">
            <Link href="/">
                <Button variant="outline" className="mb-6">← 목록으로 돌아가기</Button>
            </Link>
            
            <Card className="shadow-lg">
                <CardHeader>
                    <CardTitle className="text-2xl">사고 현장 분석 ({post.category})</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* YouTube Iframe Player */}
                    <div className="aspect-video w-full bg-black rounded-lg overflow-hidden shadow-inner">
                        <iframe
                            width="100%"
                            height="100%"
                            src={`https://www.youtube.com/embed/${videoId}`}
                            title="YouTube video player"
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        ></iframe>
                    </div>
                    
                    {/* 설명 텍스트 영역 */}
                    <div className="p-6 bg-muted/50 rounded-md text-lg leading-relaxed border">
                        <h3 className="font-semibold mb-2 text-primary">당시 상황 설명</h3>
                        <p className="whitespace-pre-wrap">{post.content}</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}