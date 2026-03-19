// client/src/components/features/post/CommentSection.tsx

"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { MessageSquare, Trash2, Send } from "lucide-react";

interface Comment {
    id: number;
    content: string;
    createdAt: string;
    user: { id: number; nickname: string; role: string; };
}

interface CommentSectionProps {
    postId: string;
}

const getRoleBadge = (role: string) => {
    switch (role) {
        case 'MASTER': return <span className="text-[10px] font-extrabold text-amber-500 ml-1">👑 MASTER</span>;
        case 'EXPERT': return <span className="text-[10px] font-extrabold text-blue-500 ml-1">🎖️ EXPERT</span>;
        default: return <span className="text-[10px] font-bold text-slate-400 ml-1">🌱 BEGINNER</span>;
    }
};

export function CommentSection({ postId }: CommentSectionProps) {
    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [currentUser, setCurrentUser] = useState<any>(null);

    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

    useEffect(() => {
        const userStr = localStorage.getItem('user');
        if (userStr) setCurrentUser(JSON.parse(userStr));

        fetchComments();
    }, [postId]);

    const fetchComments = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/posts/${postId}/comments`);
            if (res.ok) {
                const data = await res.json();
                setComments(data);
            }
        } catch (error) {
            console.error("댓글 로딩 실패", error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        if (!token) return alert("로그인이 필요합니다.");
        if (!newComment.trim()) return;

        setIsSubmitting(true);
        try {
            const res = await fetch(`${API_BASE_URL}/api/posts/${postId}/comments`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ content: newComment })
            });

            if (res.ok) {
                setNewComment("");
                fetchComments(); // 작성 완료 후 목록 새로고침
            } else {
                const err = await res.json();
                alert(err.message);
            }
        } catch (error) {
            alert("댓글 작성 중 오류가 발생했습니다.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (commentId: number) => {
        if (!confirm("댓글을 삭제하시겠습니까?")) return;
        const token = localStorage.getItem('token');
        
        try {
            const res = await fetch(`${API_BASE_URL}/api/posts/${postId}/comments/${commentId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.ok) {
                fetchComments();
            } else {
                alert("삭제 권한이 없거나 실패했습니다.");
            }
        } catch (error) {
            alert("서버 통신 오류가 발생했습니다.");
        }
    };

    return (
        <div className="mt-12 bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200 dark:border-slate-800">
            <h3 className="text-xl font-bold mb-6 text-slate-900 dark:text-white flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-blue-500" />
                사고 원인 분석 및 토론 <span className="text-blue-500 text-base">({comments.length})</span>
            </h3>

            {/* 댓글 작성 폼 */}
            <form onSubmit={handleSubmit} className="mb-8 relative">
                <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder={currentUser ? "객관적인 사고 분석 의견을 남겨주세요." : "로그인 후 댓글을 작성할 수 있습니다."}
                    disabled={!currentUser || isSubmitting}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 pr-16 resize-none focus:ring-2 focus:ring-blue-500 outline-none text-sm dark:text-white min-h-[100px] disabled:opacity-50"
                />
                <Button 
                    type="submit" 
                    disabled={!currentUser || isSubmitting || !newComment.trim()}
                    className="absolute bottom-3 right-3 rounded-lg bg-blue-600 hover:bg-blue-700 w-10 h-10 p-0 flex items-center justify-center shadow-md"
                >
                    <Send className="w-4 h-4 text-white" />
                </Button>
            </form>

            {/* 댓글 리스트 */}
            <div className="space-y-4">
                {comments.length === 0 ? (
                    <p className="text-center text-slate-500 py-6">아직 작성된 의견이 없습니다. 첫 번째 의견을 남겨보세요!</p>
                ) : (
                    comments.map(comment => (
                        <div key={comment.id} className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800/80 group">
                            <div className="flex justify-between items-start mb-2">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-600 font-bold text-xs">
                                        {comment.user.nickname.substring(0, 1)}
                                    </div>
                                    <div>
                                        <span className="font-bold text-sm text-slate-800 dark:text-slate-200">
                                            {comment.user.nickname}
                                            {getRoleBadge(comment.user.role)}
                                        </span>
                                        <span className="block text-xs text-slate-400">
                                            {new Date(comment.createdAt).toLocaleString('ko-KR')}
                                        </span>
                                    </div>
                                </div>
                                
                                {/* 본인 댓글일 경우에만 삭제 버튼 노출 */}
                                {currentUser && currentUser.id === comment.user.id && (
                                    <button 
                                        onClick={() => handleDelete(comment.id)}
                                        className="text-slate-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 p-1"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                            <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap pl-10 leading-relaxed">
                                {comment.content}
                            </p>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}