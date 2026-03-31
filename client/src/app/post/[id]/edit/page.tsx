// client/src/app/post/[id]/edit/page.tsx

"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Save, Pencil } from "lucide-react";
import { AccidentSketchbook, SketchbookRef } from "@/components/features/post/AccidentSketchbook";

export default function EditPostPage() {
    const params = useParams();
    const router = useRouter();
    const postId = params.id as string;

    const [title, setTitle] = useState("");
    const [category, setCategory] = useState("NORMAL");
    const [content, setContent] = useState("");
    const [existingSketch, setExistingSketch] = useState<string | null>(null); //  기존 스케치 데이터를 담을 상태
    const [isVoteEnabled, setIsVoteEnabled] = useState(true); // ✅ 신규 상태 추가 - Ver 2026.03.20
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // 🚀 스케치북 리모컨
    const sketchbookRef = useRef<SketchbookRef>(null);

    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

    // 🚀 1. 기존 데이터 불러오기 및 2차 권한 검증 (프론트 단 방어)
    useEffect(() => {
        const fetchPost = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/api/posts/${postId}`);
                if (!res.ok) throw new Error("게시글을 불러올 수 없습니다.");
                const data = await res.json();

                const userStr = localStorage.getItem('user');
                const currentUser = userStr ? JSON.parse(userStr) : null;

                // 본인이 아니면 돌려보냄!
                if (!currentUser || currentUser.id !== data.writerId) {
                    alert("수정 권한이 없습니다.");
                    router.push(`/post/${postId}`);
                    return;
                }

                // 기존 데이터 폼에 채워넣기 (바인딩)
                setTitle(data.title || ""); //  제목 채워넣기
                setCategory(data.category);
                setContent(data.content);
                setIsVoteEnabled(data.isVoteEnabled); // ✅ 기존 데이터 바인딩 - Ver 2026.03.20
                setExistingSketch(data.sketchUrl || null); // ✅ 기존 스케치 이미지 세팅
            } catch (error) {
                alert("데이터를 불러오는 중 오류가 발생했습니다.");
                router.push(`/post/${postId}`);
            } finally {
                setIsLoading(false);
            }
        };
        fetchPost();
    }, [postId, router, API_BASE_URL]);

    // 2. 🚀 AI 템플릿 자동완성 함수 - Ver 2026.03.31
    const handleTemplateApply = () => {
        setContent("- 사고 발생 위치 (예: 교차로, 스쿨존): \n- 나의 주행 속도 및 상황: \n- 상대방의 특이 행동: \n- 억울한 점: ");
    };

    // 3. 🚀 수정 데이터 백엔드로 제출
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        const token = localStorage.getItem('token');

        // ✅ 수정 로직: 캔버스에 새로 그린 그림이 있는지 확인
        const newSketch = sketchbookRef.current?.exportImage() || null;

        // 새로 그린 그림이 있으면 그것을 쓰고, 안 그렸으면 기존 그림(existingSketch)을 그대로 유지!
        const finalSketchUrl = newSketch ? newSketch : existingSketch;
        try {
            const res = await fetch(`${API_BASE_URL}/api/posts/${postId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ title, category, content, sketchUrl: finalSketchUrl, isVoteEnabled })
            });

            if (res.ok) {
                alert("게시글이 성공적으로 수정되었습니다.");
                router.push(`/post/${postId}`); // 성공 시 상세 페이지로 원복
            } else {
                const errData = await res.json();
                alert(errData.message || "수정에 실패했습니다.");
            }
        } catch (error) {
            alert("서버 통신 중 오류가 발생했습니다.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) return <div className="text-center py-20 font-bold text-xl">데이터를 불러오는 중... ⏳</div>;

    return (
        <div className="container mx-auto p-4 sm:p-6 lg:p-8 max-w-4xl">
            <Button variant="ghost" onClick={() => router.back()} className="mb-6 hover:bg-slate-100 dark:hover:bg-slate-800 -ml-4">
                <ArrowLeft className="w-5 h-5 mr-2" /> 돌아가기
            </Button>

            <Card className="shadow-lg border-0 ring-1 ring-slate-200 dark:ring-slate-800 bg-white dark:bg-slate-900 rounded-2xl">
                <CardHeader className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 pb-5">
                    <CardTitle className="text-2xl font-extrabold flex items-center gap-2">
                        <Pencil className="w-6 h-6 text-blue-600" />
                        게시글 수정
                    </CardTitle>
                    <CardDescription>
                        사고 카테고리와 당시 상황 설명을 수정할 수 있습니다. (증거 무결성을 위해 영상 원본은 수정할 수 없습니다)
                    </CardDescription>
                </CardHeader>

                <form onSubmit={handleSubmit}>
                    <CardContent className="space-y-6 pt-6">

                        {/* ✅ 신규: 명시적 제목 입력 칸 */}
                        <div className="space-y-2">
                            <Label htmlFor="title" className="text-sm font-bold text-slate-700 dark:text-slate-300">게시글 제목</Label>
                            <Input
                                id="title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="게시글의 제목을 입력하세요"
                                required
                                className="bg-muted focus-visible:ring-primary"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="category" className="text-sm font-bold text-slate-700 dark:text-slate-300">사고 유형 (카테고리)</Label>
                            <select
                                id="category"
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:ring-2 focus:ring-ring"
                                required
                            >
                                <option value="NORMAL">🚗 일반 사고(차선변경 등)</option>
                                <option value="SUDDEN_ACCEL">🚨 급발진/페달오조작</option>
                                <option value="DILEMMA_ZONE">🚥 딜레마존</option>
                                <option value="JAYWALKING">🚶 무단횡단 사고</option>
                                <option value="RECKLESS_DRIVING">💢 보복/난폭운전</option>
                                <option value="SCHOOL_ZONE">🚸 스쿨존 사고</option>
                                <option value="FUNNY">🤣 황당/어이없는 사고</option>
                                <option value="HEARTWARMING">💖 훈훈한 블랙박스</option>
                                <option value="LEGENDARY">😎 레전드 회피</option>
                            </select>

                            {/* 🚀 신규 추가: 투표 활성화/비활성화 토글 UI- Ver 2026.03.20 */}
                            <div className="flex items-center justify-between space-y-2 p-4 border border-input rounded-lg bg-slate-50 dark:bg-slate-800/50 mt-4">
                                <div className="space-y-0.5">
                                    <Label className="text-base font-bold text-slate-700 dark:text-slate-300">투표 활성화</Label>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">다른 사용자들이 과실 비율을 투표할 수 있도록 허용합니다.</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="sr-only peer"
                                        checked={isVoteEnabled}
                                        onChange={(e) => setIsVoteEnabled(e.target.checked)}
                                    />
                                    <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                                </label>
                            </div>
                        </div>

                        {/* ✅ 신규: AI 템플릿 버튼 및 분리된 상황 설명 칸 - Ver 2026.03.31 */}
                        <div className="space-y-2">
                            <div className="flex justify-between items-end">
                                <Label htmlFor="content" className="text-sm font-bold text-slate-700 dark:text-slate-300">당시 상황 설명</Label>
                                <Button type="button" variant="outline" size="sm" onClick={handleTemplateApply} className="text-xs font-bold border-blue-200 text-blue-600 hover:bg-blue-50 dark:border-blue-900 dark:text-blue-400 dark:hover:bg-blue-900/30 transition-colors">
                                    ✍️ AI 분석용 템플릿 적용하기
                                </Button>
                            </div>
                            <textarea
                                id="content"
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                placeholder="사고 당시의 상황을 객관적이고 상세하게 적어주세요."
                                required
                                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring min-h-[200px] resize-y"
                            />
                        </div>

                        {/* ✅ 기존 스케치 출력 및 새로운 스케치북 Ver 2026.03.31 */}
                        <div className="space-y-2 pt-4 border-t border-slate-200 dark:border-slate-800">
                            <div className="space-y-0.5 mb-4">
                                <Label className="text-base font-bold text-slate-700 dark:text-slate-300">사고 현장 스케치북 수정 (선택)</Label>
                                <p className="text-sm text-slate-500 dark:text-slate-400">아래 캔버스에 새롭게 스케치를 그리면 기존 스케치를 덮어씁니다. 그리지 않으면 기존 스케치가 유지됩니다.</p>
                            </div>

                            {/* 🚀 기존에 그린 스케치가 있다면 미리 보여주기! */}
                            {existingSketch && (
                                <div className="mb-6 p-4 border border-dashed border-slate-300 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800/30">
                                    <p className="text-xs font-bold text-slate-500 mb-2">📌 현재 저장된 스케치</p>
                                    <img src={existingSketch} alt="기존 스케치" className="w-full max-w-lg mx-auto border border-slate-200 dark:border-slate-700 rounded bg-white" />
                                </div>
                            )}

                            {/* 새로운 스케치를 그릴 수 있는 도화지 */}
                            <AccidentSketchbook ref={sketchbookRef} />
                        </div>
                    </CardContent>

                    <CardFooter className="bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 pt-5 pb-5 flex justify-end gap-3">
                        <Button type="button" variant="outline" onClick={() => router.back()} className="w-24">
                            취소
                        </Button>
                        <Button type="submit" disabled={isSubmitting} className="w-32 bg-blue-600 hover:bg-blue-700 text-white font-bold">
                            {isSubmitting ? "저장 중..." : <><Save className="w-4 h-4 mr-2" /> 저장하기</>}
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}