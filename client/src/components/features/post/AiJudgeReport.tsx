"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bot, Sparkles, Loader2, AlignLeft, Scale, Lightbulb, ChevronDown, ChevronUp } from "lucide-react";

interface AiJudgeReportProps {
    postId: number;
    cachedData?: any;
}

export function AiJudgeReport({ postId, cachedData }: AiJudgeReportProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [aiData, setAiData] = useState<any>(cachedData || null);

    const handleAIAnalyze = async () => {
        try {
            setIsAnalyzing(true);
            const token = localStorage.getItem("token");
            // 🚨 포트를 4000으로 맞추고 환경변수 안전하게 적용
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
            const res = await fetch(`${API_URL}/api/posts/${postId}/ai-analyze`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token && { 'Authorization': `Bearer ${token}` })
                }
            });

            if (!res.ok) throw new Error('AI 분석에 실패했습니다.');
            const data = await res.json();

            // 🚨 백엔드 응답 데이터가 aiSummary 객체 안에 있든, 바로 오든 완벽하게 잡아냄!
            const finalData = data.aiSummary || data;
            if (finalData && finalData.predictedPrecedent) {
                setAiData(finalData);
            } else {
                throw new Error("분석 데이터를 불러오지 못했습니다.");
            }
        } catch (error) {
            console.error('AI Analyze Error:', error);
            alert("AI 분석 중 오류가 발생했습니다.");
        } finally {
            setIsAnalyzing(false);
        }
    };

    return (
        <div className="mt-6 w-full animate-in fade-in">
            {/* 🚀 토글 버튼 */}
            <Button
                onClick={() => setIsOpen(!isOpen)}
                variant="outline"
                className="w-full h-14 flex justify-between items-center px-5 rounded-2xl border-indigo-200 dark:border-indigo-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-all shadow-sm"
            >
                <span className="flex items-center gap-2 font-black text-indigo-700 dark:text-indigo-400 text-lg">
                    <Bot className="w-6 h-6" />
                    AI 판사 1차 분석 리포트
                </span>
                {isOpen ? <ChevronUp className="text-indigo-500" /> : <ChevronDown className="text-indigo-500" />}
            </Button>

            {/* 🚀 접었다 폈다 하는 AI 리포트 영역 */}
            {isOpen && (
                <Card className="mt-4 shadow-xl border border-indigo-200 dark:border-indigo-900/50 bg-gradient-to-br from-indigo-50/50 to-white dark:from-slate-900 dark:to-slate-900 overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 dark:bg-indigo-500/20 blur-3xl rounded-full -mr-10 -mt-10 pointer-events-none"></div>

                    <CardContent className="pt-6 relative z-10 px-4 sm:px-6">
                        {!aiData ? (
                            <div className="text-center py-8">
                                <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Bot className="w-8 h-8 text-indigo-400 dark:text-indigo-500" />
                                </div>
                                <p className="text-sm text-slate-600 dark:text-slate-400 mb-6 font-medium">
                                    가장 먼저 객관적인 AI의 의견을 들어보세요!
                                </p>
                                <Button
                                    onClick={handleAIAnalyze}
                                    disabled={isAnalyzing}
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold w-full py-6 rounded-xl shadow-md"
                                >
                                    {isAnalyzing ? (
                                        <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> 정황 분석 중...</>
                                    ) : (
                                        <><Sparkles className="w-5 h-5 mr-2" /> AI에게 분석 맡기기</>
                                    )}
                                </Button>
                            </div>
                        ) : (
                            <div className="space-y-5 animate-in fade-in slide-in-from-top-2 duration-500">
                                <div className="bg-white dark:bg-slate-800 rounded-xl p-5 shadow-sm border border-indigo-100 dark:border-indigo-900/50 text-center">
                                    <p className="text-xs font-extrabold text-indigo-600 dark:text-indigo-400 mb-1">예측 과실 비율 (블박 : 상대)</p>
                                    <h3 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">
                                        {aiData.predictedPrecedent}
                                    </h3>
                                </div>

                                <div className="bg-white dark:bg-slate-800 rounded-xl p-5 shadow-sm border border-slate-100 dark:border-slate-700">
                                    <h4 className="font-bold flex items-center gap-2 mb-3 text-slate-800 dark:text-slate-200 text-base">
                                        <AlignLeft className="w-5 h-5 text-blue-500" /> 상황 요약
                                    </h4>
                                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{aiData.summary}</p>
                                </div>
                                <div className="bg-white dark:bg-slate-800 rounded-xl p-5 shadow-sm border border-slate-100 dark:border-slate-700">
                                    <h4 className="font-bold flex items-center gap-2 mb-3 text-slate-800 dark:text-slate-200 text-base">
                                        <Scale className="w-5 h-5 text-emerald-500" /> 핵심 쟁점
                                    </h4>
                                    <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-2 list-disc pl-5 marker:text-emerald-500">
                                        {aiData.keyIssues?.map((issue: string, idx: number) => <li key={idx}>{issue}</li>)}
                                    </ul>
                                </div>
                                <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-xl p-5 border border-indigo-100 dark:border-indigo-800/50 flex gap-3 items-start">
                                    <Lightbulb className="w-6 h-6 text-amber-500 shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-sm font-extrabold text-indigo-800 dark:text-indigo-300 mb-1.5">작성자를 위한 조언</p>
                                        <p className="text-sm text-indigo-900 dark:text-indigo-200 leading-relaxed">{aiData.adviceForWriter}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    );
}