"use client";

import { useParams } from "next/navigation";
import { usePostDetail } from "@/hooks/usePostDetail";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { VideoPlayer } from "@/components/features/post/VideoPlayer"; // ✅ 방금 만든 컴포넌트 불러오기

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
                    <CardTitle className="text-2xl font-bold border-b pb-4">
                        🚨 사고 현장 분석 ({post.category})
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 pt-4">

                    {/* 🚀 우리가 만든 커스텀 비디오 플레이어 장착! */}
                    {videoId ? (
                        <VideoPlayer videoId={videoId} />
                    ) : (
                        <div className="aspect-video bg-muted flex items-center justify-center rounded-lg">
                            <p>유효하지 않은 영상입니다.</p>
                        </div>
                    )}

                    {/* 상황 설명 영역 */}
                    <div className="p-6 bg-muted/50 rounded-md text-lg leading-relaxed border shadow-sm">
                        <h3 className="font-bold mb-3 text-primary flex items-center gap-2">
                            📝 당시 상황 설명
                        </h3>
                        <p className="whitespace-pre-wrap text-foreground/90">{post.content}</p>
                    </div>

                </CardContent>
            </Card>
        </div>
    );
}