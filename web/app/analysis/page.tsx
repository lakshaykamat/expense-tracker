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
import { EmptyState } from '@/components/empty-state'

export const dynamic = "force-dynamic";

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
        <div className="flex items-center justify-center min-h-[calc(100vh-8rem)] md:min-h-[calc(100vh-4rem)]">
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
          <EmptyState
            title="No budget data"
            description="Create a budget to see your analysis"
            icon={
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            }
          />
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
