import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/auth-context";

const VECTORIZE_API = import.meta.env.VITE_VECTORIZE_API || "http://localhost:3001";

export interface UserUpload {
    id: string;
    user_id: string;
    file_name: string;
    file_url: string;
    thumbnail_url: string;
    file_type: string;
    file_size: number;
    width: number;
    height: number;
    created_at: string;
    updated_at: string;
}

interface UseUserUploadsReturn {
    uploads: UserUpload[];
    loading: boolean;
    error: string | null;
    uploadFile: (file: File) => Promise<UserUpload | null>;
    deleteUpload: (id: string) => Promise<boolean>;
    refetch: () => Promise<void>;
}

export function useUserUploads(): UseUserUploadsReturn {
    const { user } = useAuth();
    const [uploads, setUploads] = useState<UserUpload[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchUploads = useCallback(async () => {
        if (!user?.id) {
            setUploads([]);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await fetch(
                `${VECTORIZE_API}/user-uploads?userId=${user.id}`
            );

            if (!response.ok) {
                throw new Error("Failed to fetch uploads");
            }

            const data = await response.json();
            setUploads(data.uploads || []);
        } catch (err) {
            console.error("Error fetching uploads:", err);
            setError(err instanceof Error ? err.message : "Failed to fetch uploads");
            setUploads([]);
        } finally {
            setLoading(false);
        }
    }, [user?.id]);

    const uploadFile = useCallback(
        async (file: File): Promise<UserUpload | null> => {
            if (!user?.id) {
                setError("User not authenticated");
                return null;
            }

            setLoading(true);
            setError(null);

            try {
                const formData = new FormData();
                formData.append("file", file);
                formData.append("userId", user.id);

                const response = await fetch(`${VECTORIZE_API}/upload`, {
                    method: "POST",
                    body: formData,
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || "Failed to upload file");
                }

                const data = await response.json();
                const newUpload = data.upload;

                // Add to local state
                setUploads((prev) => [newUpload, ...prev]);

                return newUpload;
            } catch (err) {
                console.error("Error uploading file:", err);
                setError(err instanceof Error ? err.message : "Failed to upload file");
                return null;
            } finally {
                setLoading(false);
            }
        },
        [user?.id]
    );

    const deleteUpload = useCallback(
        async (id: string): Promise<boolean> => {
            if (!user?.id) {
                setError("User not authenticated");
                return false;
            }

            setLoading(true);
            setError(null);

            try {
                const response = await fetch(
                    `${VECTORIZE_API}/user-uploads/${id}?userId=${user.id}`,
                    {
                        method: "DELETE",
                    }
                );

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || "Failed to delete upload");
                }

                // Remove from local state
                setUploads((prev) => prev.filter((upload) => upload.id !== id));

                return true;
            } catch (err) {
                console.error("Error deleting upload:", err);
                setError(err instanceof Error ? err.message : "Failed to delete upload");
                return false;
            } finally {
                setLoading(false);
            }
        },
        [user?.id]
    );

    // Fetch uploads on mount and when user changes
    useEffect(() => {
        fetchUploads();
    }, [fetchUploads]);

    return {
        uploads,
        loading,
        error,
        uploadFile,
        deleteUpload,
        refetch: fetchUploads,
    };
}
