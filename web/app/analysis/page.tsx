'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { PageHeader } from '@/components/page-header'
import { PageLayout } from '@/components/page-layout'
import { useBudgets } from '@/hooks/useBudgets'
import { useAnalysisStats } from '@/hooks/useAnalysisStats'
import { useMonthSelection } from '@/hooks/useMonthSelection'
import { Spinner } from '@/components/ui/spinner'
import { formatCurrency } from '@/utils/currency.utils'
import { getProgressColor } from '@/utils/analysis.utils'

export default function AnalysisPage() {
  const { budgets, currentBudget, loading: budgetsLoading } = useBudgets()
  const { selectedMonth, setSelectedMonth, availableMonths } = useMonthSelection({
    budgets,
    currentBudget
  })
  const { analysisStats, loading: statsLoading } = useAnalysisStats(selectedMonth)

  const loading = budgetsLoading || statsLoading

  if (loading) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Spinner size="lg" />
        </div>
      </PageLayout>
    )
  }

  if (!analysisStats || !analysisStats.budgetExists) {
    return (
      <PageLayout>
        <div className="space-y-8">
          <PageHeader
            availableMonths={availableMonths}
            selectedMonth={selectedMonth}
            onMonthChange={setSelectedMonth}
            showButton={false}
          />
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <h3 className="text-xl font-light text-gray-900 mb-2">No budget data</h3>
              <p className="text-gray-500">
                Create a budget to see your analysis
              </p>
            </div>
          </div>
        </div>
      </PageLayout>
    )
  }

  const {
    totalBudget = 0,
    totalExpenses = 0,
    remainingBudget = 0,
    budgetUsedPercentage = 0
  } = analysisStats

  return (
    <PageLayout>
      <div className="space-y-8">
        <PageHeader
          availableMonths={availableMonths}
          selectedMonth={selectedMonth}
          onMonthChange={setSelectedMonth}
          showButton={false}
        />

        <Card className='pt-6'>
          <CardContent>
            <div className="space-y-6">
              <div className="text-center">
                <span className="text-lg font-bold text-gray-900">
                  {budgetUsedPercentage.toFixed(1)}%
                </span>
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
    </PageLayout>
  )
}
