'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { PageHeader } from '@/components/page-header'
import { PageLayout } from '@/components/page-layout'
import { useBudgets } from '@/hooks/useBudgets'
import { useExpenses } from '@/hooks/useExpenses'
import { Spinner } from '@/components/ui/spinner'

export default function AnalysisPage() {
  const { budgets, currentBudget, loading: budgetsLoading } = useBudgets()
  const { expenses, loading: expensesLoading } = useExpenses()
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null)

  // Auto-select current month or latest budget month
  useEffect(() => {
    if (currentBudget && !selectedMonth) {
      setSelectedMonth(currentBudget.month)
    } else if (budgets.length > 0 && !selectedMonth) {
      const latestBudget = budgets.reduce((latest, budget) => {
        return budget.month > latest.month ? budget : latest
      }, budgets[0])
      setSelectedMonth(latestBudget.month)
    }
  }, [currentBudget, budgets, selectedMonth])

  const loading = budgetsLoading || expensesLoading

  if (loading) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Spinner size="lg" />
        </div>
      </PageLayout>
    )
  }

  const selectedBudget = selectedMonth ? budgets.find(b => b.month === selectedMonth) : currentBudget

  // Calculate expenses for selected month
  const monthExpenses = selectedMonth ? expenses.filter(expense => {
    const expenseMonth = new Date(expense.date).toISOString().slice(0, 7)
    return expenseMonth === selectedMonth
  }) : []

  const totalExpenses = monthExpenses.reduce((sum, expense) => sum + expense.amount, 0)
  const totalBudget = selectedBudget?.totalBudget || 0
  const remainingBudget = totalBudget - totalExpenses
  const budgetUsedPercentage = totalBudget > 0 ? (totalExpenses / totalBudget) * 100 : 0

  const formatMonth = (monthString: string) => {
    const date = new Date(monthString + '-01')
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const availableMonths = budgets.map(b => b.month).sort((a, b) => b.localeCompare(a))

  const getProgressColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-red-500'
    if (percentage >= 70) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  return (
    <PageLayout>
      <div className="space-y-8">
        {/* Page Header */}
        <PageHeader
          availableMonths={availableMonths}
          selectedMonth={selectedMonth}
          onMonthChange={setSelectedMonth}
          showButton={false}
        />

        {selectedBudget ? (
          <div className="space-y-6">
            {/* Minimal Budget Progress Card */}
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="text-center">
                    <span className="text-lg font-bold text-gray-900">{budgetUsedPercentage.toFixed(1)}%</span>
                  </div>
                  <div className="relative">
                    <Progress 
                      value={Math.min(budgetUsedPercentage, 100)} 
                      className="h-2 [&>div]:bg-transparent"
                    />
                    <div 
                      className={`absolute top-0 left-0 h-full rounded-full transition-all duration-300 ${getProgressColor(budgetUsedPercentage)}`}
                      style={{ width: `${Math.min(budgetUsedPercentage, 100)}%` }}
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="bg-blue-50 rounded-lg p-3">
                      <div className="text-lg font-semibold text-blue-900">
                        {formatCurrency(totalBudget)}
                      </div>
                      <div className="text-xs text-blue-600">Budget</div>
                    </div>
                    <div className="bg-orange-50 rounded-lg p-3">
                      <div className="text-lg font-semibold text-orange-900">
                        {formatCurrency(totalExpenses)}
                      </div>
                      <div className="text-xs text-orange-600">Spent</div>
                    </div>
                    <div className={`rounded-lg p-3 ${
                      remainingBudget >= 0 ? 'bg-green-50' : 'bg-red-50'
                    }`}>
                      <div className={`text-lg font-semibold ${
                        remainingBudget >= 0 ? 'text-green-900' : 'text-red-900'
                      }`}>
                        {formatCurrency(Math.abs(remainingBudget))}
                      </div>
                      <div className={`text-xs ${
                        remainingBudget >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {remainingBudget >= 0 ? 'Left' : 'Over'}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <h3 className="text-xl font-light text-gray-900 mb-2">No budget data</h3>
              <p className="text-gray-500">
                Create a budget to see your analysis
              </p>
            </div>
          </div>
        )}
      </div>
    </PageLayout>
  )
}
