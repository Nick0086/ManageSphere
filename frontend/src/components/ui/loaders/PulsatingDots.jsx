import { cn } from '@/lib/utils'
import { motion } from 'motion/react'

export default function PulsatingDots({ className }) {
    return (
        <div className="flex items-center justify-center">
            <div className="flex space-x-2">
                <motion.div
                    className={cn("size-3 rounded-full bg-indigo-500", className)}
                    animate={{
                        scale: [1, 1.5, 1],
                        opacity: [0.5, 1, 0.5],
                    }}
                    transition={{
                        duration: 1,
                        ease: 'easeInOut',
                        repeat: Infinity,
                    }}
                />
                <motion.div
                    className={cn("size-3 rounded-full bg-indigo-500", className)}
                    animate={{
                        scale: [1, 1.5, 1],
                        opacity: [0.5, 1, 0.5],
                    }}
                    transition={{
                        duration: 1,
                        ease: 'easeInOut',
                        repeat: Infinity,
                        delay: 0.3,
                    }}
                />
                <motion.div
                    className={cn("size-3 rounded-full bg-indigo-500", className)}
                    animate={{
                        scale: [1, 1.5, 1],
                        opacity: [0.5, 1, 0.5],
                    }}
                    transition={{
                        duration: 1,
                        ease: 'easeInOut',
                        repeat: Infinity,
                        delay: 0.6,
                    }}
                />
            </div>
        </div>
    )
}