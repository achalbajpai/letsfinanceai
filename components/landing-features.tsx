"use client"

import { motion } from "framer-motion"
import { 
  LineChart, 
  DollarSign, 
  Bitcoin, 
  Calculator, 
  FileText, 
  BarChart
} from "lucide-react"

export default function LandingFeatures() {
  const features = [
    {
      icon: <DollarSign className="h-8 w-8" />,
      title: "Expense Tracking",
      description: "Easily track and categorize your expenses across multiple currencies"
    },
    {
      icon: <LineChart className="h-8 w-8" />,
      title: "Investment Portfolio",
      description: "Monitor your stock investments with real-time data and analysis"
    },
    {
      icon: <Bitcoin className="h-8 w-8" />,
      title: "Crypto Management",
      description: "Track your cryptocurrency portfolio and monitor market trends"
    },
    {
      icon: <Calculator className="h-8 w-8" />,
      title: "Tax Calculator",
      description: "Estimate your taxes and identify potential deductions"
    },
    {
      icon: <BarChart className="h-8 w-8" />,
      title: "Financial Health",
      description: "Get insights into your overall financial wellbeing and recommendations"
    },
    {
      icon: <FileText className="h-8 w-8" />,
      title: "PDF Reports",
      description: "Generate comprehensive financial reports and statements"
    }
  ]

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3
      }
    }
  }

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  }

  return (
    <div className="py-20 px-4 max-w-7xl mx-auto">
      <motion.h2 
        className="text-2xl md:text-3xl font-bold text-center mb-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        Powerful Financial Tools at Your Fingertips
      </motion.h2>
      
      <motion.p 
        className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9 }}
      >
        LetsFinance<span className="text-cyan-400">AI</span> provides a comprehensive suite of tools to help you manage your finances and make informed decisions.
      </motion.p>
      
      <motion.div 
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        variants={container}
        initial="hidden"
        animate="show"
      >
        {features.map((feature, index) => (
          <motion.div 
            key={index}
            className="bg-card border border-border/40 rounded-xl p-6 hover:shadow-lg transition-all backdrop-blur-sm"
            variants={item}
          >
            <div className="p-3 bg-primary/10 rounded-xl w-fit mb-4">
              <div className="text-primary">{feature.icon}</div>
            </div>
            <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
            <p className="text-muted-foreground">{feature.description}</p>
          </motion.div>
        ))}
      </motion.div>
    </div>
  )
} 