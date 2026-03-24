// client/src/app/mypage/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useTheme } from "next-themes"; // 🚀 신규 추가: 다크모드 감지용 훅 - Ver 2026.03.24
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, ShieldCheck, History, Trophy, Lock, BarChart3, Info, X } from "lucide-react";
// 🚀 Recharts 임포트 (데이터 시각화) - Ver 2026.03.24
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';

export default function MyPage() {
    const router = useRouter();

    const { theme } = useTheme(); // 🚀 현재 테마(light/dark) 가져오기
    const [mounted, setMounted] = useState(false); // 🚀 하이드레이션 에러 방지용

    const [profile, setProfile] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    useEffect(() => {
        setMounted(true);
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        const token = localStorage.getItem("token");
        if (!token) {
            alert("로그인이 필요합니다.");
            router.push("/login");
            return;
        }

        const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
        try {
            const res = await fetch(`${API_BASE_URL}/api/auth/me`, {
                headers: { "Authorization": `Bearer ${token}` }
            });

            // 🚀 [추가] 토큰이 만료되었거나 유효하지 않은 경우 (401 에러 처리) - Ver 2026.03.24
            if (res.status === 401) {
                alert("로그인이 만료되었습니다. 다시 로그인해주세요.");
                localStorage.removeItem("token");
                localStorage.removeItem("user");
                router.push("/login");
                return;
            }

            if (!res.ok) throw new Error("프로필을 불러올 수 없습니다.");
            const data = await res.json();
            setProfile(data);
        } catch (error) {
            console.error(error);
            localStorage.removeItem("token");
            router.push("/login");
        } finally {
            setIsLoading(false);
        }
    };

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) return alert("새 비밀번호가 일치하지 않습니다.");

        const token = localStorage.getItem("token");
        const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

        try {
            const res = await fetch(`${API_BASE_URL}/api/auth/password`, {
                method: "PUT",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                body: JSON.stringify({ currentPassword, newPassword })
            });

            const data = await res.json();
            if (res.ok) {
                alert("비밀번호가 성공적으로 변경되었습니다.");
                // 🚀 성공 시 모달 닫기 및 초기화
                setIsPasswordModalOpen(false);
                setCurrentPassword(""); setNewPassword(""); setConfirmPassword("");
            } else {
                alert(data.message);
            }
        } catch (error) {
            alert("서버 오류가 발생했습니다.");
        }
    };

    const getRoleBadge = (role: string) => {
        switch (role) {
            case 'MASTER': return <span className="bg-amber-100 text-amber-700 border border-amber-300 px-3 py-1 rounded-full text-xs font-extrabold shadow-sm">👑 MASTER</span>;
            case 'EXPERT': return <span className="bg-blue-100 text-blue-700 border border-blue-300 px-3 py-1 rounded-full text-xs font-extrabold shadow-sm">🎖️ EXPERT</span>;
            default: return <span className="bg-slate-100 text-slate-600 border border-slate-300 px-3 py-1 rounded-full text-xs font-bold shadow-sm">🌱 BEGINNER</span>;
        }
    };

    const getCategoryBadge = (category: string) => {
        switch (category) {
            case 'SUDDEN_ACCEL': return <span className="bg-red-100 text-red-800 text-xs font-bold px-2 py-0.5 rounded-md">🚨 급발진</span>;
            case 'DILEMMA_ZONE': return <span className="bg-amber-100 text-amber-800 text-xs font-bold px-2 py-0.5 rounded-md">🚥 딜레마존</span>;
            default: return <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2 py-0.5 rounded-md">🚗 일반사고</span>;
        }
    };

    // 🚀 MBTI 칭호에 따른 예쁜 색상/이모지 반환 헬퍼 함수 - Ver 2026.03.24
    const getMbtiBadge = (type: string) => {
        switch (type) {
            case '엄격한 심판관': return <span className="text-red-600 dark:text-red-400 font-black">🧑‍⚖️ 엄격한 심판관</span>;
            case '블박차 빙의': return <span className="text-emerald-600 dark:text-emerald-400 font-black">😇 블박차 빙의</span>;
            case '예측불허 갈대': return <span className="text-purple-600 dark:text-purple-400 font-black">🌪️ 예측불허 갈대</span>;
            default: return <span className="text-blue-600 dark:text-blue-400 font-black">⚖️ 객관적 솔로몬</span>;
        }
    };

    if (isLoading) return <div className="text-center py-20 font-bold text-xl">정보를 불러오는 중...</div>;
    if (!profile) return null;

    return (
        <div className="container mx-auto p-4 sm:p-6 lg:p-8 max-w-5xl">
            <h1 className="text-3xl font-extrabold mb-8 text-slate-900 dark:text-white flex items-center gap-3">
                <User className="w-8 h-8 text-blue-600" /> 마이페이지
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* 👈 왼쪽: 프로필 및 보안 영역 */}
                <div className="space-y-8 md:col-span-1">
                    <Card className="shadow-md border-0 ring-1 ring-slate-200 dark:ring-slate-800 bg-white dark:bg-slate-900">
                        <CardHeader className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 text-center pb-8 pt-8">
                            <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/50 rounded-full mx-auto flex items-center justify-center mb-4 shadow-inner">
                                <Trophy className="w-10 h-10 text-blue-600 dark:text-blue-400" />
                            </div>
                            <CardTitle className="text-2xl font-extrabold mb-2">{profile.nickname}</CardTitle>

                            {/* 🚀 등급(Tier) 배지 및 승급 조건 툴팁 - Ver 2026.03.24 */}
                            <div className="flex justify-center items-center gap-1.5 mb-2 relative group cursor-help w-max mx-auto">
                                {getRoleBadge(profile.role)}
                                <Info className="w-4 h-4 text-slate-400 hover:text-blue-500 transition-colors" />

                                {/* 툴팁 본문 */}
                                <div className="absolute top-8 left-1/2 -translate-x-1/2 w-64 p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl opacity-0 group-hover:opacity-100 transition-opacity z-20 pointer-events-none text-left">
                                    <p className="font-extrabold text-sm mb-2 text-slate-800 dark:text-slate-200">🏆 등급(Tier) 승급 조건</p>
                                    <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1.5">
                                        <li><strong className="text-slate-700 dark:text-slate-300">🌱 BEGINNER:</strong> 가입 시 기본 부여</li>
                                        <li><strong className="text-blue-500">🎖️ EXPERT:</strong> 판결(투표) 3회 이상 참여</li>
                                        <li><strong className="text-amber-500">👑 MASTER:</strong> 판결(투표) 10회 이상 참여</li>
                                    </ul>
                                </div>
                            </div>

                            <p className="text-sm text-slate-500 font-medium">{profile.email}</p>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <div className="flex justify-between items-center py-3 border-b border-slate-100 dark:border-slate-800">
                                <span className="text-slate-600 dark:text-slate-400 font-bold">가입일</span>
                                <span className="text-slate-900 dark:text-white font-medium">{new Date(profile.createdAt).toLocaleDateString('ko-KR')}</span>
                            </div>
                            <div className="flex justify-between items-center py-3">
                                <span className="text-slate-600 dark:text-slate-400 font-bold">총 참여 투표</span>
                                <span className="text-blue-600 dark:text-blue-400 font-extrabold">{profile.votes.length} 회</span>
                            </div>

                            {/* 🚀 신규: 비밀번호 변경 모달 오픈 버튼 - Ver 2026.03.24 */}
                            <Button
                                variant="outline"
                                className="w-full mt-6 font-bold border-slate-300 dark:border-slate-700"
                                onClick={() => setIsPasswordModalOpen(true)}
                            >
                                <Lock className="w-4 h-4 mr-2" /> 비밀번호 변경
                            </Button>
                        </CardContent>
                    </Card>
                </div>

                {/* 👉 오른쪽: 투표 MBTI 차트 및 기록 영역 */}
                <div className="md:col-span-2 space-y-8">

                    {/* 🚀 신규: 운전 MBTI 방사형 차트 영역 -Ver 2026.03.24 */}
                    <Card className="shadow-md border-0 ring-1 ring-slate-200 dark:ring-slate-800 overflow-visible">
                        <CardHeader className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="text-xl flex items-center gap-2">
                                    <BarChart3 className="w-5 h-5 text-purple-500" /> 나의 판결 성향 분석
                                </CardTitle>
                                <CardDescription className="mt-1">대중의 평균 판결과 나의 판결 편차를 분석한 결과입니다.</CardDescription>
                            </div>

                            {/* 🚀 툴팁 영역 (호버 시 설명창 노출) */}
                            <div className="relative group cursor-help ml-2">
                                <div className="p-2 bg-slate-200 dark:bg-slate-700 rounded-full text-slate-500 dark:text-slate-300 hover:text-purple-600 transition-colors">
                                    <Info className="w-5 h-5" />
                                </div>
                                {/* 툴팁 본문 */}
                                <div className="absolute right-0 top-10 w-72 p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl opacity-0 group-hover:opacity-100 transition-opacity z-20 pointer-events-none">
                                    <p className="font-extrabold text-sm mb-2 text-slate-800 dark:text-slate-200">💡 운전 MBTI란?</p>
                                    <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-2">
                                        <li><strong className="text-red-500">🧑‍⚖️ 엄격한 심판관:</strong> 대중보다 블박차에게 엄격하게 과실을 묻는 성향</li>
                                        <li><strong className="text-emerald-500">😇 블박차 빙의:</strong> 대중보다 블박차에게 관대하게 과실을 묻는 성향</li>
                                        <li><strong className="text-blue-500">⚖️ 객관적 솔로몬:</strong> 대중의 평균과 매우 일치하는 성향</li>
                                        <li><strong className="text-purple-500">🌪️ 예측불허 갈대:</strong> 판결의 일관성이 다소 부족한 성향</li>
                                    </ul>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-8 pb-8 flex flex-col items-center">

                            {profile.mbti && mounted ? (
                                <>
                                    <div className="w-full h-[280px] max-w-md mx-auto">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={profile.mbti.chartData}>
                                                {/* 🚀 다크모드 대응: 그리드 및 텍스트 색상 수동 주입 */}
                                                <PolarGrid stroke={theme === 'dark' ? '#475569' : '#cbd5e1'} />
                                                <PolarAngleAxis
                                                    dataKey="subject"
                                                    tick={{ fill: theme === 'dark' ? '#f8fafc' : '#334155', fontSize: 13, fontWeight: 800 }}
                                                />
                                                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                                                {/* 🚀 다크/라이트 모드에서 모두 선명한 톤다운 퍼플 컬러 */}
                                                <Radar
                                                    name="성향"
                                                    dataKey="value"
                                                    stroke="#9333ea"
                                                    strokeWidth={3}
                                                    fill="#a855f7"
                                                    fillOpacity={0.5}
                                                />
                                            </RadarChart>
                                        </ResponsiveContainer>
                                    </div>
                                    <div className="mt-6 text-center bg-slate-50 dark:bg-slate-800/80 px-8 py-4 rounded-2xl w-full max-w-md border border-slate-200 dark:border-slate-700 shadow-sm">
                                        <p className="text-sm text-slate-500 dark:text-slate-400 font-bold mb-1">데이터가 분석한 당신의 운전 MBTI는?</p>
                                        <p className="text-2xl">{getMbtiBadge(profile.mbti.type)}</p>
                                    </div>
                                </>
                            ) : (
                                <div className="text-center py-12 text-slate-500">
                                    <BarChart3 className="w-12 h-12 mx-auto mb-4 text-slate-300 opacity-50" />
                                    <p className="font-medium">아직 참여한 판결이 없어 성향을 분석할 수 없습니다.</p>
                                    <p className="text-sm mt-2">사고 영상에 투표를 남겨보세요!</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* 기존 투표 기록 영역 */}
                    <Card className="shadow-md border-0 ring-1 ring-slate-200 dark:ring-slate-800 h-full">
                        <CardHeader className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                            <CardTitle className="text-xl flex items-center gap-2">
                                <History className="w-5 h-5 text-blue-500" /> 내 판결 기록
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6">
                            {profile.votes.length === 0 ? (
                                <div className="text-center py-12 text-slate-500">
                                    <ShieldCheck className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                                    <p>아직 참여한 판결이 없습니다.</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {profile.votes.map((vote: any) => (
                                        <Link href={`/post/${vote.post.id}`} key={vote.id} className="block group">
                                            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-blue-400 hover:shadow-md transition-all flex flex-col sm:flex-row justify-between gap-4">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        {getCategoryBadge(vote.post.category)}
                                                        <span className="text-xs text-slate-400">{new Date(vote.createdAt).toLocaleDateString('ko-KR')}</span>
                                                    </div>
                                                    <h4 className="font-bold text-slate-800 dark:text-slate-200 line-clamp-1 group-hover:text-blue-500 transition-colors">
                                                        {vote.post.content.split('\n')[0]}
                                                    </h4>
                                                </div>
                                                <div className="shrink-0 flex items-center justify-end sm:justify-start gap-4 bg-slate-50 dark:bg-slate-800 px-4 py-2 rounded-lg">
                                                    <div className="text-center">
                                                        <p className="text-[10px] text-slate-500 font-bold mb-0.5">내 판결</p>
                                                        <p className="text-sm font-extrabold text-blue-600">{vote.myFault} <span className="text-slate-400 font-normal">:</span> {vote.opponentFault}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* 🚀 비밀번호 변경 모달(Modal) 창 - Ver 2026.03.24 */}
            {isPasswordModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <Card className="w-full max-w-sm shadow-2xl border-0 ring-1 ring-slate-200 dark:ring-slate-800 bg-white dark:bg-slate-900">
                        <CardHeader className="flex flex-row justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-4">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Lock className="w-5 h-5 text-slate-500" /> 비밀번호 변경
                            </CardTitle>
                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => setIsPasswordModalOpen(false)}>
                                <X className="w-4 h-4" />
                            </Button>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <form onSubmit={handlePasswordChange} className="space-y-4">
                                <div className="space-y-1.5">
                                    <Label>현재 비밀번호</Label>
                                    <Input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required />
                                </div>
                                <div className="space-y-1.5">
                                    <Label>새 비밀번호</Label>
                                    <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
                                </div>
                                <div className="space-y-1.5">
                                    <Label>새 비밀번호 확인</Label>
                                    <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
                                </div>
                                <Button type="submit" className="w-full bg-slate-900 hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-700 font-bold mt-2">
                                    변경 완료
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}