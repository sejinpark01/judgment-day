// client/src/components/features/post/VideoPlayer.tsx

"use client";

import { useRef, useState, useEffect } from "react";
import YouTube, { YouTubeEvent, YouTubePlayer } from "react-youtube";
import { Button } from "@/components/ui/button";
import { Play, Pause, Rewind, FastForward, SkipBack, SkipForward, Volume2, VolumeX, Maximize } from "lucide-react";

// isShorts 속성 추가 Ver 2026.03.16
interface VideoPlayerProps {
    videoId: string;
    isShorts?: boolean;
}

// 🕒 초(seconds)를 [분:초.밀리초] 형식(예: 01:23.4)으로 예쁘게 바꿔주는 함수
const formatTime = (seconds: number) => {
    if (!seconds) return "00:00.0";
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 10); // 소수점 첫째 자리(0.1초)까지 표시
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}.${ms}`;
};

export function VideoPlayer({ videoId, isShorts = false }: VideoPlayerProps) {
    const containerRef = useRef<HTMLDivElement>(null); // ✅ 전체 화면을 위한 컨테이너 Ref - Ver 2026.04.07
    const playerRef = useRef<YouTubePlayer | null>(null);
    const progressBarRef = useRef<HTMLDivElement>(null); // ✅ 재생바 DOM에 접근하기 위한 Ref - Ver 2026.03.16

    const [isPlaying, setIsPlaying] = useState(false);

    // 🚀 현재 시간과 총 영상 길이
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [isDragging, setIsDragging] = useState(false); // ✅ 드래그 상태 관리 - Ver 2026.03.16

    // 🚀 볼륨 및 음소거 상태 추가 - Ver 2026.04.07
    const [volume, setVolume] = useState(100);
    const [isMuted, setIsMuted] = useState(false);

    // 유튜브 플레이어 옵션 설정
    const opts = {
        width: "100%",
        height: "100%",
        playerVars: { autoplay: 0, rel: 0, modestbranding: 1, controls: 0, disablekb: 1 },
    };

    const onReady = (event: YouTubeEvent) => {
        playerRef.current = event.target;
        // 영상이 로드되면 총 길이와 초기 시간을 세팅!
        setDuration(event.target.getDuration());
        setCurrentTime(event.target.getCurrentTime());
        setVolume(event.target.getVolume());
        setIsMuted(event.target.isMuted());
    };

    const onStateChange = (event: YouTubeEvent) => {
        setIsPlaying(event.data === 1); // 1 = PLAYING
    };

    // 🚀 영상이 재생 중일 때 0.1초마다 현재 시간을 갱신하는 타이머 || 스페이스바 일시정지/재생 단축키 로직 추가 - Ver 2026.03.16
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // 다른 텍스트 입력창(input, textarea)에서 타이핑 중일 때는 스페이스바 작동 방지
            const target = e.target as HTMLElement;
            if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;

            if (e.code === 'Space') {
                e.preventDefault(); // 스크롤 내려가는 것 방지
                if (playerRef.current) {
                    const state = playerRef.current.getPlayerState();
                    if (state === YouTube.PlayerState.PLAYING) {
                        playerRef.current.pauseVideo();
                    } else {
                        playerRef.current.playVideo();
                    }
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);



    const handlePlayPause = () => {
        if (playerRef.current) {
            if (isPlaying) {
                playerRef.current.pauseVideo();
            } else {
                playerRef.current.playVideo();
            }
        }
    };

    // 🚀 버튼 클릭 시 즉시 UI 동기화(setCurrentTime) 추가 - Ver 2026.03.16
    const handleSeek = (seconds: number) => {
        if (playerRef.current) {
            const newTime = playerRef.current.getCurrentTime() + seconds;
            playerRef.current.seekTo(newTime, true);
            setCurrentTime(newTime);
        }
    }

    // 🚀 볼륨 조절 및 전체화면 핸들러 추가 - Ver 2026.04.07
    const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newVolume = Number(e.target.value);
        setVolume(newVolume);
        if (playerRef.current) {
            playerRef.current.setVolume(newVolume);
            if (newVolume > 0 && isMuted) {
                playerRef.current.unMute();
                setIsMuted(false);
            }
        }
    };

    const toggleMute = () => {
        if (playerRef.current) {
            if (isMuted) {
                playerRef.current.unMute();
                setIsMuted(false);
                setVolume(playerRef.current.getVolume());
            } else {
                playerRef.current.mute();
                setIsMuted(true);
                setVolume(0);
            }
        }
    };

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            containerRef.current?.requestFullscreen().catch(err => {
                console.error("전체화면 전환 중 에러 발생:", err);
            });
        } else {
            document.exitFullscreen();
        }
    };

    // 🚀 마우스 위치에 따른 시간 계산 헬퍼 함수 - Ver 2026.03.16
    const calculateTimeFromMouse = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!progressBarRef.current || duration === 0) return 0;
        const rect = progressBarRef.current.getBoundingClientRect();
        let clickX = e.clientX - rect.left;
        if (clickX < 0) clickX = 0;
        if (clickX > rect.width) clickX = rect.width;
        return (clickX / rect.width) * duration;
    };

    // 🚀 마우스 이벤트들 (클릭 + 드래그) - Ver 2026.03.16
    const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
        setIsDragging(true);
        const newTime = calculateTimeFromMouse(e);
        if (playerRef.current) playerRef.current.seekTo(newTime, true);
        setCurrentTime(newTime);
    };

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (isDragging) {
            const newTime = calculateTimeFromMouse(e);
            if (playerRef.current) playerRef.current.seekTo(newTime, true);
            setCurrentTime(newTime);
        }
    };

    const handleMouseUpOrLeave = () => {
        setIsDragging(false);
    };

    // 영상 재생 중 자동 시간 업데이트
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isPlaying && playerRef.current && !isDragging) {
            interval = setInterval(async () => {
                const time = await playerRef.current.getCurrentTime();
                setCurrentTime(time);
            }, 100);
        }
        return () => clearInterval(interval);
    }, [isPlaying, isDragging]);

    return (
        <div ref={containerRef} className="w-full bg-slate-950 rounded-t-xl sm:rounded-none group">
            {/* 🚀 isShorts 여부에 따라 aspect-ratio와 최대 너비(max-w) 동적 적용 Ver - 2026.03.16 */}
            <div
                className={`relative w-full ${isShorts ? 'aspect-[9/16] max-w-[400px] mx-auto' : 'aspect-video'} bg-black overflow-hidden shadow-inner cursor-pointer`}
                onClick={handlePlayPause}
            >
                <YouTube
                    videoId={videoId}
                    opts={opts}
                    onReady={onReady}
                    onStateChange={onStateChange}
                    className="absolute top-0 left-0 w-full h-full pointer-events-none"
                />
            </div>

            {/* 컨트롤러 UI 영역  */}
            <div className="bg-slate-900 p-4 border-t border-slate-800">
                {/*  재생바 */}
                <div className="flex justify-between items-center mb-4 px-2">
                    <span className="text-blue-400 font-mono text-sm font-semibold">
                        {formatTime(currentTime)}
                    </span>
                    {/* 🚀 드래그 이벤트 부착 및 터치/클릭 영역 확대를 위해 높이를 h-3으로 키움 */}
                    <div
                        ref={progressBarRef}
                        className="flex-1 mx-4 h-3 bg-slate-700 rounded-full overflow-hidden cursor-pointer relative group/bar"
                        onMouseDown={handleMouseDown}
                        onMouseMove={handleMouseMove}
                        onMouseUp={handleMouseUpOrLeave}
                        onMouseLeave={handleMouseUpOrLeave}
                    >
                        {/* 차오르는 파란색 게이지 */}
                        <div
                            className="absolute top-0 left-0 h-full bg-blue-500 transition-all duration-100 ease-linear group-hover:bg-blue-400"
                            style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
                        />
                    </div>

                    <span className="text-slate-400 font-mono text-sm w-16 text-center">
                        {formatTime(duration)}
                    </span>
                </div>

                {/* 하단 컨트롤러 레이아웃 (재생버튼 + 볼륨/전체화면) */}
                <div className="flex flex-col lg:flex-row justify-between items-center gap-4 w-full">
                    {/* PC에서 밸런스를 맞추기 위한 빈 div */}
                    <div className="hidden lg:flex lg:w-36"></div>

                    {/* 🚀 중앙 재생 컨트롤: flex-nowrap으로 절대 줄바꿈 불가, 모바일에서도 무조건 한 줄 유지 */}
                    <div className="flex flex-nowrap justify-center items-center gap-1 sm:gap-2">
                        <Button variant="outline" onClick={() => handleSeek(-5)} title="5초 뒤로" className="bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white h-9 px-2 sm:px-3 shrink-0">
                            <Rewind className="w-4 h-4 sm:mr-1" /> <span className="hidden sm:inline">5초</span>
                        </Button>
                        <Button variant="secondary" onClick={() => handleSeek(-0.1)} title="-0.1초" className="bg-slate-800 text-blue-400 hover:bg-slate-700 hover:text-blue-300 font-bold h-9 px-2 sm:px-3 shrink-0">
                            <SkipBack className="w-4 h-4 sm:mr-1" /> <span className="hidden sm:inline">0.1</span>
                        </Button>

                        <Button onClick={handlePlayPause} className="w-12 h-10 sm:w-14 bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/20 rounded-full mx-1 shrink-0 transition-transform active:scale-95 flex items-center justify-center">
                            {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-1" />}
                        </Button>

                        <Button variant="secondary" onClick={() => handleSeek(0.1)} title="+0.1초" className="bg-slate-800 text-red-400 hover:bg-slate-700 hover:text-red-300 font-bold h-9 px-2 sm:px-3 shrink-0">
                            <span className="hidden sm:inline">0.1</span> <SkipForward className="w-4 h-4 sm:ml-1" />
                        </Button>
                        <Button variant="outline" onClick={() => handleSeek(5)} title="5초 앞으로" className="bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white h-9 px-2 sm:px-3 shrink-0">
                            <span className="hidden sm:inline">5초</span> <FastForward className="w-4 h-4 sm:ml-1" />
                        </Button>
                    </div>

                    {/* 🚀 우측 볼륨/전체화면: flex-nowrap으로 줄바꿈 방지 */}
                    <div className="flex flex-nowrap items-center justify-center lg:justify-end gap-3 w-full lg:w-36 mt-2 lg:mt-0 shrink-0">
                        <button onClick={toggleMute} className="text-slate-400 hover:text-white transition-colors">
                            {isMuted || volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                        </button>
                        <input
                            type="range"
                            min="0"
                            max="100"
                            value={isMuted ? 0 : volume}
                            onChange={handleVolumeChange}
                            className="w-16 sm:w-20 h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                        />
                        <button onClick={toggleFullscreen} className="text-slate-400 hover:text-white transition-colors ml-1" title="전체화면">
                            <Maximize className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>

            <p className="text-center text-xs text-slate-500 py-3 bg-slate-950 rounded-b-xl sm:rounded-none">
                ※ 0.1초 버튼으로 정확한 사고 프레임을 확인하세요.
            </p>
        </div>
    );
}