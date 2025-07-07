import Skeleton from './ui/Skeleton';

interface CardSkeletonProps {
    isCircle?: boolean;
}

const CardSkeleton: React.FC<CardSkeletonProps> = ({ isCircle = false }) => {
    return (
        <div className="bg-gray-800 p-4 rounded-lg">
            <Skeleton className={`w-full mb-4 ${isCircle ? 'rounded-full aspect-square h-auto' : 'aspect-square'}`} />
            <Skeleton className="h-4 w-3/4 mb-2" />
            <Skeleton className="h-3 w-1/2" />
        </div>
    );
};

export const CardGridSkeleton = ({ count = 5, isCircle = false }) => {
    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {Array.from({ length: count }).map((_, i) => (
                <CardSkeleton key={i} isCircle={isCircle} />
            ))}
        </div>
    );
};