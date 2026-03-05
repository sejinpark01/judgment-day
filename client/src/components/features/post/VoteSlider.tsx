// client/src/components/features/post/VoteSlider.tsx

"use client";

import { useState } from "react";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Scale } from "lucide-react";

interface VoteSliderProps {
    postId: string;
}

export function VoteSlider({ postId }: VoteSliderProps) {
    // shadcn/ui 슬라이더는 배열 형태의 값을 사용해. 초기값은 50:50!
    const [myFault, setMyFault] = useState<number[]>([50]); 
    const opponentFault = 100 - myFault[0];

    const handleVoteSubmit = () => {
        // TODO: 다음 단계에서 Socket.io 및 DB 전송 로직이 들어갈 자리!
        console.log(`[투표 제출] 게시글 ID: ${postId} | 내 과실: ${myFault[0]}% | 상대 과실: ${opponentFault}%`);
        alert(`투표가 임시 제출되었습니다!\n내 과실 ${myFault[0]}% / 상대 과실 ${opponentFault}%`);
    };

    return (
        <div className="bg-card p-6 rounded-lg border shadow-sm flex flex-col items-center">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Scale className="w-6 h-6 text-primary" />
                당신의 판결은 몇 대 몇입니까?
            </h3>
            
            {/* 비율 텍스트 표시 영역 */}
            <div className="flex justify-between w-full max-w-md mb-2 font-extrabold text-lg px-2">
                <span className="text-blue-600">블랙박스 차주 <br/><span className="text-3xl">{myFault[0]}%</span></span>
                <span className="text-red-600 text-right">상대방 <br/><span className="text-3xl">{opponentFault}%</span></span>
            </div>

            {/* 🚀 shadcn/ui 슬라이더 적용 (10 단위로 움직임) */}
            <div className="w-full max-w-md py-6">
                <Slider
                    defaultValue={[50]}
                    max={100}
                    step={10}
                    value={myFault}
                    onValueChange={setMyFault}
                    className="cursor-pointer"
                />
            </div>

            {/* 안내 문구 및 제출 버튼 */}
            <p className="text-sm text-muted-foreground mb-6 text-center">
                슬라이더를 좌우로 움직여 과실 비율을 조정해주세요.
            </p>
            <Button onClick={handleVoteSubmit} size="lg" className="w-full max-w-md font-bold text-lg">
                판결 제출하기
            </Button>
        </div>
    );
}