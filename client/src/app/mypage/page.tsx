// client/src/app/mypage/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, ShieldCheck, History, Trophy, Lock } from "lucide-react";

export default function MyPage() {
    const router = useRouter();
    const [profile, setProfile] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    useEffect(() => {
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

    if (isLoading) return <div className="text-center py-20 font-bold text-xl">정보를 불러오는 중...</div>;
    if (!profile) return null;

    return (
        <div className="container mx-auto p-4 sm:p-6 lg:p-8 max-w-5xl">
            <h1 className="text-3xl font-extrabold mb-8 text-slate-900 dark:text-white flex items-center gap-3">
                <User className="w-8 h-8 text-blue-600" /> 마이페이지
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="space-y-8 md:col-span-1">
                    <Card className="shadow-md border-0 ring-1 ring-slate-200 dark:ring-slate-800 bg-white dark:bg-slate-900">
                        <CardHeader className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 text-center pb-8 pt-8">
                            <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/50 rounded-full mx-auto flex items-center justify-center mb-4 shadow-inner">
                                <Trophy className="w-10 h-10 text-blue-600 dark:text-blue-400" />
                            </div>
                            <CardTitle className="text-2xl font-extrabold mb-2">{profile.nickname}</CardTitle>
                            <div className="flex justify-center mb-2">{getRoleBadge(profile.role)}</div>
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
                        </CardContent>
                    </Card>

                    <Card className="shadow-md border-0 ring-1 ring-slate-200 dark:ring-slate-800">
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Lock className="w-5 h-5 text-slate-500" /> 비밀번호 변경
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handlePasswordChange} className="space-y-4">
                                <div>
                                    <Label>현재 비밀번호</Label>
                                    <Input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required />
                                </div>
                                <div>
                                    <Label>새 비밀번호</Label>
                                    <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
                                </div>
                                <div>
                                    <Label>새 비밀번호 확인</Label>
                                    <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
                                </div>
                                <Button type="submit" className="w-full bg-slate-900 dark:bg-blue-600 font-bold">변경하기</Button>
                            </form>
                        </CardContent>
                    </Card>
                </div>

                <div className="md:col-span-2">
                    <Card className="shadow-md border-0 ring-1 ring-slate-200 dark:ring-slate-800 h-full">
                        <CardHeader className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                            <CardTitle className="text-xl flex items-center gap-2">
                                <History className="w-5 h-5 text-blue-500" /> 내 판결 기록
                            </CardTitle>
                            <CardDescription>과거에 투표한 사고 영상과 판결(과실 비율) 내역입니다.</CardDescription>
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
        </div>
    );
}