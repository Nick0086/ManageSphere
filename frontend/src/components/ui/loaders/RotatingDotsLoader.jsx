import React from 'react';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils'

export default function RotatingDotsLoader({
    size = 'md',
    dotColor = 'bg-indigo-500',
    className
}) {
    const sizeClasses = {
        sm: 'h-8 w-8',
        md: 'h-12 w-12',
        lg: 'h-16 w-16',
    };

    const dotSizeClasses = {
        sm: 'h-2 w-2',
        md: 'h-4 w-4',
        lg: 'h-6 w-6',
    };

    const rotateVariants = {
        rotate: {
            rotate: 360,
            transition: {
                duration: 1.5,
                repeat: Infinity,
                ease: 'linear',
            },
        },
    };

    return (
        <div className={cn("flex items-center justify-center", className)}>
            <motion.div
                className={cn("relative", sizeClasses[size])}
                variants={rotateVariants}
                animate="rotate"
            >
                {[0, 0.2, 0.4, 0.6].map((delay, index) => (
                    <motion.div
                        key={index}
                        className={cn(
                            "absolute rounded-full",
                            dotSizeClasses[size],
                            dotColor,
                            {
                                'left-0 top-0': index === 0,
                                'right-0 top-0': index === 1,
                                'left-0 bottom-0': index === 2,
                                'right-0 bottom-0': index === 3,
                            }
                        )}
                        initial="initial"
                        animate="animate"
                        transition={{ delay }}
                    />
                ))}
            </motion.div>
        </div>
    );
}