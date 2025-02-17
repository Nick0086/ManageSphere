import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { ArrowDownIcon, ArrowUpIcon } from 'lucide-react'
import React from 'react'

export default function MetricCard({ title, icon, currentValue, description, trend }) {
    return (
        <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg h-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 pt-3">
                <CardTitle className="text-sm font-medium text-primary">{title}</CardTitle>
                {icon}
            </CardHeader>
            <CardContent className='pb-3' >
                <div className="text-2xl font-bold">{currentValue}</div>
                <p className="text-xs mt-1 text-secondary">{description}</p>
                {trend && (
                    <div
                        className={cn(
                            "text-xs font-medium mt-2",
                            trend?.direction === "up"
                                ? "text-green-600"
                                : trend?.direction === "down"
                                    ? "text-red-600"
                                    : "text-gray-600",
                        )}
                    >
                        {trend?.direction === "up" && <ArrowUpIcon className="inline h-4 w-4 mr-1" />}
                        {trend?.direction === "down" && <ArrowDownIcon className="inline h-4 w-4 mr-1" />}
                        {trend?.value}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
