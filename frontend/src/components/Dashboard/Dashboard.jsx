import React from 'react'
import MetricCard from './components/MetricCard'
import { Clock, CreditCard, ShoppingBag, Utensils } from 'lucide-react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (index) => ({
    opacity: 1,
    y: 0,
    transition: { delay: index * 0.15, duration: 0.4, ease: 'easeOut' },
  }),
}

export default function Dashboard() {
  const metrics = [
    {
      title: 'Orders Today',
      currentValue: '30',
      description: 'Count of orders placed today',
      icon: <ShoppingBag className="h-6 w-6" />,
      trend: { direction: 'up', value: `20% from last week` },
    },
    {
      title: 'Active Orders',
      currentValue: '20',
      description: 'Ongoing orders being prepared or pending',
      icon: <Clock className="h-6 w-6" />,
    },
    {
      title: 'Total Revenue Today',
      currentValue: '3000',
      description: 'Sum of all paid orders from today',
      icon: <CreditCard className="h-6 w-6" />,
      trend: { direction: 'up', value: `2% from last week` },
    },
    {
      title: 'Total Menu Items',
      currentValue: '30',
      description: 'Count of active menu items',
      icon: <Utensils className="h-6 w-6" />,
    },
  ]

  return (
    <div className='flex flex-col gap-4' >
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 "
        initial="hidden"
        animate="visible"
      >
        {metrics.map((metric, index) => (
          <motion.div key={metric.title} custom={index} variants={cardVariants}>
            <MetricCard {...metric} />
          </motion.div>
        ))}
      </motion.div>

      <div className='grid grid-cols-12 gap-4' >
        <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg lg:col-span-4 md:col-span-6 col-span-12 min-h-20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 pt-3">
            <CardTitle className="text-sm font-medium text-primary">Weekly Revenue Trends</CardTitle>
          </CardHeader>
          <CardContent className='pb-3' >

          </CardContent>
        </Card>

        <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg lg:col-span-4 md:col-span-6 col-span-12 min-h-20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 pt-3">
            <CardTitle className="text-sm font-medium text-primary">Weekly Order Trends</CardTitle>
          </CardHeader>
          <CardContent className='pb-3' >

          </CardContent>
        </Card>

        <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg lg:col-span-4 md:col-span-6 col-span-12 min-h-20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 pt-3">
            <CardTitle className="text-sm font-medium text-primary">Best Selling Items</CardTitle>
          </CardHeader>
          <CardContent className='pb-3' >

          </CardContent>
        </Card>

        <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg lg:col-span-4 md:col-span-6 col-span-12 min-h-20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 pt-3">
            <CardTitle className="text-sm font-medium text-primary">Peak Hours Analysis</CardTitle>
          </CardHeader>
          <CardContent className='pb-3' >

          </CardContent>
        </Card>
        
        <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg lg:col-span-4 md:col-span-6 col-span-12 min-h-20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 pt-3">
            <CardTitle className="text-sm font-medium text-primary">Latest Orders</CardTitle>
          </CardHeader>
          <CardContent className='pb-3' >

          </CardContent>
        </Card>

        <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg lg:col-span-4 md:col-span-6 col-span-12 min-h-20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 pt-3">
            <CardTitle className="text-sm font-medium text-primary">Category-wise Sales</CardTitle>
          </CardHeader>
          <CardContent className='pb-3' >

          </CardContent>
        </Card>

        <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg lg:col-span-4 md:col-span-6 col-span-12 min-h-20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 pt-3">
            <CardTitle className="text-sm font-medium text-primary">Recent Menu Updates</CardTitle>
          </CardHeader>
          <CardContent className='pb-3' >

          </CardContent>
        </Card>

        <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg lg:col-span-4 md:col-span-6 col-span-12 min-h-20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 pt-3">
            <CardTitle className="text-sm font-medium text-primary">Recent Payments & Billing</CardTitle>
          </CardHeader>
          <CardContent className='pb-3' >

          </CardContent>
        </Card>
      </div>
    </div>
  )
}
