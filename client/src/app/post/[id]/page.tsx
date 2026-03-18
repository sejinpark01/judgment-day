// client/src/app/post/[id]/page.tsx

"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { usePostDetail } from "@/hooks/usePostDetail";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { VideoPlayer } from "@/components/features/post/VideoPlayer";
import { VoteSlider } from "@/components/features/post/VoteSlider"; // ✅ 투표 슬라이더 불러오기 (ver 2026.03.05)
// ✅  아이콘 추가 - Ver 2026.03.16
import { Pencil, ArrowLeft, Eye, Calendar, User, Edit, Trash2 } from "lucide-react"; //✅ Edit, Trash2 아이콘 추가함. Ver-2026.03.18 


// 카테고리 뱃지 함수
const getCategoryBadge = (category: string) => {
    switch (category) {
        case 'SUDDEN_ACCEL': return <span className="bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300 text-xs font-bold px-2.5 py-1 rounded-md">🚨 급발진/오조작</span>;
        case 'DILEMMA_ZONE': return <span className="bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300 text-xs font-bold px-2.5 py-1 rounded-md">🚥 딜레마존</span>;
        case 'JAYWALKING': return <span className="bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-300 text-xs font-bold px-2.5 py-1 rounded-md">🚶 무단횡단</span>;
        case 'RECKLESS_DRIVING': return <span className="bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300 text-xs font-bold px-2.5 py-1 rounded-md">💢 보복/난폭</span>;
        case 'SCHOOL_ZONE': return <span className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300 text-xs font-bold px-2.5 py-1 rounded-md">🚸 스쿨존</span>;
        case 'NORMAL':
        default: return <span className="bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300 text-xs font-bold px-2.5 py-1 rounded-md">🚗 일반사고</span>;
    }
};

// 👑 등급(Tier)별 예쁜 색상 뱃지 헬퍼 함수 -Ver 2026.03.17
const getRoleBadge = (role: string) => {
    switch (role) {
        case 'MASTER': return <span className="bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-400 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-800 ml-2 shadow-sm">👑 MASTER</span>;
        case 'EXPERT': return <span className="bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-400 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-blue-200 dark:border-blue-800 ml-2 shadow-sm">🎖️ EXPERT</span>;
        case 'BEGINNER':
        default: return <span className="bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-slate-200 dark:border-slate-700 ml-2">🌱 BEGINNER</span>;
    }
};


// 🚀 강력해진 유튜브 URL 추출 함수
function extractVideoId(url: string) {
    if (!url) return '';
    const match = url.match(/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    return match ? match[1] : '';
}

export default function PostDetailPage() {
    const params = useParams();
    const router = useRouter(); // ✅ 라우터 임포트 Ver 2026.03.16
    const postId = params.id as string;
    const { post, isLoading, error } = usePostDetail(postId);

    // 🚀  현재 로그인한 유저 정보 확인 로직 추가 - Ver 2026.03.18
    const [currentUser, setCurrentUser] = useState<any>(null);

    useEffect(() => {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            try {
                setCurrentUser(JSON.parse(userStr));
            } catch (e) {
                console.error('Failed to parse user data');
            }
        }
    }, []);

    // 🚀  게시글 삭제 로직 추가 - Ver 2026.03.18
    const handleDelete = async () => {
        if (!confirm('정말로 이 게시글을 삭제하시겠습니까? (관련된 투표 기록도 모두 삭제됩니다)')) return;

        const token = localStorage.getItem('token');
        const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

        try {
            const res = await fetch(`${API_BASE_URL}/api/posts/${postId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.ok) {
                alert('게시글이 성공적으로 삭제되었습니다.');
                router.push('/'); // 삭제 성공 시 메인으로 이동
            } else {
                const data = await res.json();
                alert(data.message || '삭제에 실패했습니다.');
            }
        } catch (err) {
            alert('서버 오류가 발생했습니다.');
        }
    };


    if (isLoading) return <div className="text-center py-20 text-xl font-bold">사건 기록을 불러오는 중...</div>;
    if (error) return <div className="text-center text-red-500 py-20 font-bold">{error}</div>;
    if (!post) return <div className="text-center py-20">게시글이 존재하지 않습니다.</div>;

    const videoId = extractVideoId(post.videoUrl);

    // 🚀  쇼츠 영상인지 판별 (URL에 'shorts'가 포함되어 있는지 확인) - Ver 2026.03.16
    const isShorts = post.videoUrl.toLowerCase().includes('shorts');

    return (
        // 🚀  max-w-4xl에서 max-w-6xl로 확장하여 양옆 공간 확보
        <div className="container mx-auto p-4 sm:p-6 lg:p-8 max-w-6xl">

            <Button variant="ghost" onClick={() => router.back()} className="mb-6 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors -ml-4">
                <ArrowLeft className="w-5 h-5 mr-2" /> 돌아가기
            </Button>

            {/* 🚀 Grid 레이아웃 적용 (lg 화면 이상일 때 2:1 비율로 나눔) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12 xl:gap-16">

                {/* 👈 왼쪽: 영상 및 본문 영역 (col-span-2) */}
                <div className="lg:col-span-2 space-y-6">
                    <Card className="shadow-xl border-0 ring-1 ring-slate-200 dark:ring-slate-800 bg-white dark:bg-slate-900 rounded-2xl overflow-hidden">
                        <CardHeader className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 pb-5">
                            <div className="flex justify-between items-start mb-3">
                                {getCategoryBadge(post.category)}

                                {/* 🚀  로그인한 유저 == 작성자일 때만 수정/삭제 버튼 노출 - Ver 2026.03.18 */}
                                {currentUser && currentUser.id === post.writerId && (
                                    <div className="flex gap-2">
                                        <Button variant="outline" size="sm" onClick={() => router.push(`/post/${postId}/edit`)} className="h-8 text-slate-600 dark:text-slate-300 font-bold">
                                            <Edit className="w-4 h-4 mr-1.5" /> 수정
                                        </Button>
                                        <Button variant="destructive" size="sm" onClick={handleDelete} className="h-8 font-bold">
                                            <Trash2 className="w-4 h-4 mr-1.5" /> 삭제
                                        </Button>
                                    </div>
                                )}
                            </div>

                        <CardTitle className="text-2xl font-extrabold text-slate-900 dark:text-white leading-snug">
                            {post.content.split('\n')[0]}
                        </CardTitle>

                        {/* 🚀 수정된 작성자(등급 포함), 날짜, 조회수 영역  Ver-206.03.17 */}
                        <div className="flex flex-wrap items-center gap-4 mt-4 text-sm font-medium text-slate-500 dark:text-slate-400">
                            <span className="flex items-center text-slate-700 dark:text-slate-300 font-bold">
                                <User className="w-4 h-4 mr-1.5 text-slate-500" />
                                {post.writer?.nickname || "익명의 제보자"}
                                {post.writer?.role && getRoleBadge(post.writer.role)}
                            </span>
                            <span className="flex items-center gap-1.5">
                                <Calendar className="w-4 h-4" /> {new Date(post.createdAt!).toLocaleDateString('ko-KR')}
                            </span>
                            <span className="flex items-center gap-1.5">
                                <Eye className="w-4 h-4" /> {post.views}명 읽음
                            </span>
                        </div>
                    </CardHeader>

                    <CardContent className="p-0">
                        {/* 🚀  VideoPlayer에 isShorts 프롭 전달 */}
                        <VideoPlayer videoId={videoId} isShorts={isShorts} />

                        <div className="p-6 sm:p-8">
                            <h3 className="text-lg font-bold mb-4 text-slate-900 dark:text-white flex items-center gap-2">
                                📝 당시 상황 설명
                            </h3>
                            <div className="p-5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                                <p className="whitespace-pre-wrap text-slate-700 dark:text-slate-300 leading-relaxed">
                                    {post.content}
                                </p>
                            </div>

                            {/* 스케치북 영역 */}
                            {post.sketchUrl && (
                                <div className="mt-8">
                                    <h3 className="text-lg font-bold mb-4 text-slate-900 dark:text-white flex items-center gap-2">
                                        <Pencil className="w-5 h-5 text-blue-500" />
                                        🗺️ 제보자가 그린 현장 스케치
                                    </h3>
                                    <div className="w-full flex justify-center bg-slate-50 dark:bg-slate-800/50 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl p-4 overflow-hidden">
                                        <img
                                            src={post.sketchUrl}
                                            alt="사고 현장 스케치"
                                            className="max-w-full h-auto rounded-lg shadow-sm"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* 👉 오른쪽: 투표 UI 영역 (Sticky 속성으로 고정) */}
            <div className="lg:col-span-1 relative">
                {/* 🚀  sticky top-24를 통해 스크롤을 내려도 따라다니게 만듦 */}
                <div className="sticky top-24 z-10">
                    <VoteSlider postId={postId} />
                </div>
            </div>

        </div>
        </div >
    );
}