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
    if (percentage >= 100) return 'bg-red-500'
    if (percentage >= 80) return 'bg-yellow-500'
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
            {/* Main Budget Progress Card */}
            <Card className="overflow-hidden">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Budget Progress</span>
                  <span className="text-sm font-normal text-muted-foreground">
                    {formatMonth(selectedBudget.month)}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Progress Bar */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Budget Used</span>
                    <span className="font-medium">{budgetUsedPercentage.toFixed(1)}%</span>
                  </div>
                  <div className="relative">
                    <Progress 
                      value={Math.min(budgetUsedPercentage, 100)} 
                      className="h-3"
                    />
                    <div 
                      className={`absolute top-0 left-0 h-full rounded-full transition-all duration-300 ${getProgressColor(budgetUsedPercentage)}`}
                      style={{ width: `${Math.min(budgetUsedPercentage, 100)}%` }}
                    />
                  </div>
                </div>

                {/* Budget Summary */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-900">
                      {formatCurrency(totalBudget)}
                    </div>
                    <div className="text-sm text-blue-600">Total Budget</div>
                  </div>
                  
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <div className="text-2xl font-bold text-orange-900">
                      {formatCurrency(totalExpenses)}
                    </div>
                    <div className="text-sm text-orange-600">Spent</div>
                  </div>
                  
                  <div className={`text-center p-4 rounded-lg ${
                    remainingBudget >= 0 ? 'bg-green-50' : 'bg-red-50'
                  }`}>
                    <div className={`text-2xl font-bold ${
                      remainingBudget >= 0 ? 'text-green-900' : 'text-red-900'
                    }`}>
                      {formatCurrency(Math.abs(remainingBudget))}
                    </div>
                    <div className={`text-sm ${
                      remainingBudget >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {remainingBudget >= 0 ? 'Remaining' : 'Over Budget'}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Budget Items Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>Budget Items Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {selectedBudget.essentialItems
                    .slice()
                    .sort((a, b) => (b.amount || 0) - (a.amount || 0))
                    .map((item, index) => {
                      const itemExpenses = monthExpenses.filter(expense => 
                        expense.category === item.name || expense.title.toLowerCase().includes(item.name.toLowerCase())
                      )
                      const itemSpent = itemExpenses.reduce((sum, expense) => sum + expense.amount, 0)
                      const itemBudget = item.amount || 0
                      const itemUsedPercentage = itemBudget > 0 ? (itemSpent / itemBudget) * 100 : 0

                      return (
                        <div key={index} className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="font-medium">{item.name}</span>
                            <div className="text-right">
                              <div className="text-sm font-medium">
                                {formatCurrency(itemSpent)} / {formatCurrency(itemBudget)}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {itemUsedPercentage.toFixed(1)}% used
                              </div>
                            </div>
                          </div>
                          <div className="relative">
                            <Progress 
                              value={Math.min(itemUsedPercentage, 100)} 
                              className="h-2"
                            />
                            <div 
                              className={`absolute top-0 left-0 h-full rounded-full transition-all duration-300 ${getProgressColor(itemUsedPercentage)}`}
                              style={{ width: `${Math.min(itemUsedPercentage, 100)}%` }}
                            />
                          </div>
                        </div>
                      )
                    })}
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
