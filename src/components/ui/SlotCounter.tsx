"use client";

import { motion } from 'framer-motion';

const DIGIT_HEIGHT = 20;

interface SlotCounterProps {
    value: number;
}

const SlotCounter: React.FC<SlotCounterProps> = ({ value }) => {
    return (
        <div style={{ height: DIGIT_HEIGHT }} className="overflow-hidden">
            <motion.div
                animate={{ y: -value * DIGIT_HEIGHT }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
                {[...Array(10).keys()].map((digit) => (
                    <div key={digit} style={{ height: DIGIT_HEIGHT }} className="flex items-center justify-center">
                        {digit}
                    </div>
                ))}
            </motion.div>
        </div>
    );
};

export default SlotCounter;