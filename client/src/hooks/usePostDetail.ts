import { useState, useEffect } from 'react';

export function usePostDetail(postId: string) {
    const [post, setPost] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!postId) return;
        const fetchPost = async () => {
            try {
                const res = await fetch(`http://localhost:4000/api/posts/${postId}`);
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