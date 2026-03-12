import { useState, useEffect } from 'react';

export function usePostDetail(postId: string) {
    const [post, setPost] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

    useEffect(() => {
        if (!postId) return;
        const fetchPost = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/api/posts/${postId}`);
                const data = await res.json();
                if (!res.ok) throw new Error(data.message);
                setPost(data);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };
        fetchPost();
    }, [postId]);

    return { post, isLoading, error };
}