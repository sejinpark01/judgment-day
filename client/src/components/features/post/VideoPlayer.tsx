// client/src/components/features/post/VideoPlayer.tsx

"use client";

import { useRef, useState, useEffect } from "react";
import YouTube, { YouTubeEvent, YouTubePlayer } from "react-youtube";
import { Button } from "@/components/ui/button";
import { Play, Pause, Rewind, FastForward, SkipBack, SkipForward } from "lucide-react";

interface VideoPlayerProps {
    videoId: string;
}

// 🕒 초(seconds)를 [분:초.밀리초] 형식(예: 01:23.4)으로 예쁘게 바꿔주는 함수
const formatTime = (seconds: number) => {
    if (!seconds) return "00:00.0";
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 10); // 소수점 첫째 자리(0.1초)까지 표시
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}.${ms}`;
};

export function VideoPlayer({ videoId }: VideoPlayerProps) {
    const playerRef = useRef<YouTubePlayer | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    
    // 🚀 새로 추가된 상태: 현재 시간과 총 영상 길이
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);

    // 🚀 영상이 재생 중일 때 0.1초마다 현재 시간을 갱신하는 타이머
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isPlaying && playerRef.current) {
            interval = setInterval(async () => {
                const time = await playerRef.current.getCurrentTime();
                setCurrentTime(time);
            }, 100); // 100ms(0.1초) 주기로 업데이트
        }
        return () => clearInterval(interval);
    }, [isPlaying]);

    const onReady = (event: YouTubeEvent) => {
        playerRef.current = event.target;
        // 영상이 로드되면 총 길이와 초기 시간을 세팅!
        setDuration(event.target.getDuration());
        setCurrentTime(event.target.getCurrentTime());
    };

    const onStateChange = (event: YouTubeEvent) => {
        setIsPlaying(event.data === 1); // 1 = PLAYING
    };

    const handlePlayPause = () => {
        if (playerRef.current) {
            if (isPlaying) {
                playerRef.current.pauseVideo();
            } else {
                playerRef.current.playVideo();
            }
        }
    };

    const handleSeek = async (seconds: number) => {
        if (playerRef.current) {
            const current = await playerRef.current.getCurrentTime();
            const newTime = current + seconds;
            
            // 영상 범위를 벗어나지 않도록 방어 (0초 ~ 총 길이 사이)
            const safeTime = Math.max(0, Math.min(newTime, duration));
            
            playerRef.current.seekTo(safeTime, true);
            setCurrentTime(safeTime); // 누르자마자 즉시 시간 UI 업데이트
        }
    };

    return (
        <div className="space-y-4">
            <div className="aspect-video w-full bg-black rounded-lg overflow-hidden shadow-inner relative">
                <YouTube
                    videoId={videoId}
                    opts={{
                        width: '100%',
                        height: '100%',
                        playerVars: {
                            autoplay: 0,
                            rel: 0,         
                            modestbranding: 1, 
                        }
                    }}
                    onReady={onReady}
                    onStateChange={onStateChange}
                    className="absolute top-0 left-0 w-full h-full"
                />
            </div>
            
            {/* 🎛️ 고정밀 커스텀 컨트롤러 패널 */}
            <div className="flex flex-col items-center bg-muted p-4 rounded-lg border shadow-sm gap-3">
                
                {/* 🚀 0.1초 단위 디지털 타이머 표시 영역 */}
                <div className="bg-black text-green-400 font-mono text-xl px-4 py-1 rounded border-2 border-gray-700 shadow-inner w-48 text-center tracking-wider">
                    {formatTime(currentTime)} <span className="text-gray-500 text-sm">/ {formatTime(duration)}</span>
                </div>

                {/* 컨트롤러 버튼들 */}
                <div className="flex flex-wrap justify-center items-center gap-2">
                    <Button variant="outline" onClick={() => handleSeek(-5)} title="5초 뒤로">
                        <Rewind className="w-4 h-4 mr-1" /> 5초
                    </Button>
                    
                    <Button variant="secondary" onClick={() => handleSeek(-0.1)} title="-0.1초 (이전 프레임)" className="font-bold text-blue-600">
                        <SkipBack className="w-4 h-4 mr-1" /> 0.1초
                    </Button>
                    
                    <Button variant="default" onClick={handlePlayPause} className="w-20 mx-2">
                        {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                    </Button>

                    <Button variant="secondary" onClick={() => handleSeek(0.1)} title="+0.1초 (다음 프레임)" className="font-bold text-red-600">
                        0.1초 <SkipForward className="w-4 h-4 ml-1" />
                    </Button>

                    <Button variant="outline" onClick={() => handleSeek(5)} title="5초 앞으로">
                        5초 <FastForward className="w-4 h-4 ml-1" />
                    </Button>
                </div>
            </div>
            <p className="text-center text-xs text-muted-foreground mt-2">
                💡 0.1초 버튼을 클릭하여 사고의 찰나를 정밀하게 분석해보세요.
            </p>
        </div>
    );
}