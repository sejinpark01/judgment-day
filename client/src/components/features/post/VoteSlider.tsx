// client/src/components/features/post/VoteSlider.tsx
"use client";

import { clsx } from "clsx";
import { useState, useEffect } from "react";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Scale, Users } from "lucide-react";
import { io } from "socket.io-client"; // ✅ 추가

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
const socket = io(API_BASE_URL); // 백엔드 소켓 연결

interface VoteSliderProps {
    postId: string;
}

export function VoteSlider({ postId }: VoteSliderProps) {
    const [myFault, setMyFault] = useState<number[]>([50]);
    const opponentFault = 100 - myFault[0];

    // 📊 실시간 통계 상태
    const [stats, setStats] = useState({ totalVotes: 0, avgMyFault: 0, avgOpponentFault: 0 });
    const [isLoading, setIsLoading] = useState(false);

    // 🚀 컴포넌트 마운트 시 소켓 방 입장 및 초기 데이터 로드
    useEffect(() => {
        socket.emit("join_post", postId);

        fetch(`${API_BASE_URL}/api/posts/${postId}/stats`)
            .then(res => res.json())
            .then(data => setStats(data))
            .catch(err => console.error(err));

        // 누군가 투표해서 서버가 신호를 보내면 즉시 차트 갱신!
        socket.on("update_chart", (newStats) => {
            setStats(newStats);
        });

        return () => {
            socket.off("update_chart");
        };
    }, [postId]);

    const handleVoteSubmit = async () => {
        const token = localStorage.getItem('token');
        if (!token) return alert("로그인이 필요한 서비스입니다.");

        setIsLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/api/posts/${postId}/vote`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ myFault: myFault[0], opponentFault })
            });

            // 🚨 401 에러(토큰 만료/인증 실패) 처리
            if (response.status === 401) {
                localStorage.removeItem('token'); // 만료된 토큰 비우기
                throw new Error("로그인이 만료되었습니다. 다시 로그인 해주세요.");
                // 필요하다면 여기서 로그인 페이지로 이동시키는 로직을 추가할 수도 있음..
                // 예: window.location.href = '/login';
            }

           // 🚀 [수정] 429(도배 방어) 등 그 외의 서버 에러 처리 로직
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                // 백엔드가 보낸 메시지가 있으면 그걸 띄우고, 없으면 기본 메시지 띄우기
                throw new Error(errorData.message || "투표 제출에 실패했습니다. 다시 시도해 주세요.");
            }

            // 🚀 1. 소켓을 기다리지 않고 API 응답을 통해 즉시 차트를 업데이트 (스르륵 즉시 시작!)
            try {
                const newData = await response.json();
                if (newData && newData.avgMyFault !== undefined) {
                    setStats(newData);
                }
            } catch (e) {
                // 백엔드에서 JSON을 안 보내준다면 기존 소켓 로직이 알아서 처리함
            }

            // 🚀 2. 핵심 수정: 1초(1000ms) 애니메이션을 끝까지 다 감상한 뒤에(1200ms) 알림창 띄우기!
            setTimeout(() => {
                alert("성공적으로 판결이 반영되었습니다!");
            }, 1200);

        } catch (error: any) {
            alert(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-card p-6 rounded-lg border shadow-sm flex flex-col items-center">

            {/* 📊 실시간 집단지성 차트 영역 */}
            <div className="w-full max-w-2xl bg-muted/30 p-4 rounded-xl mb-10 border">

                <div className="flex justify-between items-center mb-3">
                    <h3 className="font-bold text-lg flex items-center gap-2">
                        <Users className="w-5 h-5 text-green-600" />
                        실시간 네티즌 판결 현황
                    </h3>
                    <span className="text-sm text-muted-foreground font-medium bg-muted px-2 py-1 rounded">
                        총 {stats.totalVotes}명 참여
                    </span>
                </div>

                <div className="h-8 w-full bg-red-500 rounded-full overflow-hidden flex relative shadow-inner">
                    <div
                        className={clsx(
                            "h-full bg-blue-500 flex items-center pl-4",
                            "transition-[width] duration-1000 ease-in-out" // ✨ 폭(width)이 1초(1000ms) 동안 스르륵 변하도록 강제 지정
                        )}
                        style={{ width: `${stats.avgMyFault}%` }} // Tailwind 동적 컴파일 한계로 인한 width 예외 적용
                    >
                        <span className="text-white font-bold text-sm drop-shadow-md">
                            {stats.avgMyFault}%
                        </span>
                    </div>
                    <div className="absolute right-4 h-full flex items-center">
                        <span className="text-white font-bold text-sm drop-shadow-md">
                            {stats.avgOpponentFault}%
                        </span>
                    </div>
                </div>
                <div className="flex justify-between text-xs font-bold mt-2 px-1">
                    <span className="text-blue-600">블랙박스 차주 과실</span>
                    <span className="text-red-600">상대방 과실</span>
                </div>
            </div>

            <hr className="w-full mb-8" />

            {/* 기존 슬라이더 영역 */}
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Scale className="w-6 h-6 text-primary" />
                당신의 판결은 몇 대 몇입니까?
            </h3>

            <div className="flex justify-between w-full mb-2 font-extrabold text-lg px-2">
                <span className="text-blue-600">블랙박스 차주 <br /><span className="text-3xl">{myFault[0]}%</span></span>
                <span className="text-red-600 text-right">상대방 <br /><span className="text-3xl">{opponentFault}%</span></span>
            </div>

            <div className="w-full py-6">
                <Slider
                    defaultValue={[50]} max={100} step={10}
                    value={myFault} onValueChange={setMyFault}
                    className="cursor-pointer"
                />
            </div>

            <p className="text-sm text-muted-foreground mb-6 text-center">
                슬라이더를 조작한 후 아래 버튼을 눌러 <br /> 당신의 판결을 실시간 차트에 더해주세요.
            </p>
            <Button onClick={handleVoteSubmit} disabled={isLoading} size="lg" className="w-full max-w-md font-bold text-lg">
                {isLoading ? "제출 중..." : "판결 제출하기"}
            </Button>
        </div>
    );
}