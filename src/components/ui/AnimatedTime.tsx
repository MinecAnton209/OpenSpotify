"use client";

import SlotCounter from './SlotCounter';

interface AnimatedTimeProps {
    timeInSeconds: number;
}

const AnimatedTime: React.FC<AnimatedTimeProps> = ({ timeInSeconds }) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);

    const minute_tens = Math.floor(minutes / 10);
    const minute_ones = minutes % 10;

    const second_tens = Math.floor(seconds / 10);
    const second_ones = seconds % 10;

    return (
        <div className="flex text-xs text-gray-400 font-mono">
            <SlotCounter value={minute_tens} />
            <SlotCounter value={minute_ones} />
            <span>:</span>
            <SlotCounter value={second_tens} />
            <SlotCounter value={second_ones} />
        </div>
    );
};

export default AnimatedTime;