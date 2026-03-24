// client/src/hooks/useSocketNotification.ts

import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

export function useSocketNotification(userId: number | null) {
    const [notifications, setNotifications] = useState<any[]>([]);
    const [socket, setSocket] = useState<Socket | null>(null);

    // 1. 초기 로드 시 DB에서 안 읽은 알림 가져오기
    useEffect(() => {
        if (!userId) return;
        const fetchNotifications = async () => {
            const token = localStorage.getItem('token');
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
            const res = await fetch(`${API_URL}/api/notifications`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setNotifications(data);
            }
        };
        fetchNotifications();
    }, [userId]);

    // 2. Socket 연결 및 1:1 Room 입장
    useEffect(() => {
        if (!userId) return;
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
        const newSocket = io(API_URL);
        setSocket(newSocket);

        // 내 고유 알림 방에 입장
        newSocket.emit('join_user_room', userId);

        // 새 알림 수신 리스너
        newSocket.on('new_notification', (notification) => {
            setNotifications((prev) => [notification, ...prev]);
            // 🔔 여기서 브라우저 네이티브 알림(Notification API)이나 토스트 띄우기 가능!
        });

        return () => {
            newSocket.disconnect();
        };
    }, [userId]);

    // 3. 읽음 처리
    const markAsRead = async (id: number) => {
        const token = localStorage.getItem('token');
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
        await fetch(`${API_URL}/api/notifications/${id}/read`, {
            method: 'PUT',
            headers: { Authorization: `Bearer ${token}` }
        });
        // 상태 업데이트 (목록에서 제거)
        setNotifications((prev) => prev.filter(n => n.id !== id));
    };

    return { notifications, markAsRead };
}