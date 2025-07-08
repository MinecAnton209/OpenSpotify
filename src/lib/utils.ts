const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5055';

export function resolveImageUrl(path: string | null | undefined): string {
    if (!path) {
        return 'https://placehold.co/150';
    }

    if (path.startsWith('http://') || path.startsWith('https://')) {
        return path;
    }

    return `${API_URL}${path}`;
}