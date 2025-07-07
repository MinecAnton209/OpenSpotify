import React from 'react';

function cn(...classes: (string | undefined | null | false)[]) {
    return classes.filter(Boolean).join(' ');
}

const Skeleton = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => {
    return (
        <div
            className={cn('animate-pulse rounded-md bg-gray-700', className)}
            {...props}
        />
    );
};

export default Skeleton;