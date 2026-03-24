// server/src/routes/notification.ts

import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma';
import passport from 'passport';

const router = Router();

// 1. 안 읽은 알림 목록 조회 (GET /api/notifications)
router.get('/', passport.authenticate('jwt', { session: false }), async (req: Request, res: Response) => {
    try {
        const user = req.user as any;
        const notifications = await prisma.notification.findMany({
            where: { userId: user.id, isRead: false },
            orderBy: { createdAt: 'desc' },
            take: 20 // 최근 20개만 가져옴
        });
        res.json(notifications);
    } catch (error) {
        res.status(500).json({ message: '알림 조회 중 오류가 발생했습니다.' });
    }
});

// 2. 알림 읽음 처리 (PUT /api/notifications/:id/read)
router.put('/:id/read', passport.authenticate('jwt', { session: false }), async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const user = req.user as any;
        await prisma.notification.updateMany({
            where: { id: Number(id), userId: user.id },
            data: { isRead: true }
        });
        res.json({ message: '읽음 처리 완료' });
    } catch (error) {
        res.status(500).json({ message: '알림 상태 변경 중 오류가 발생했습니다.' });
    }
});

export default router;