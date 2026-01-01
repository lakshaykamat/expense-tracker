'use client'

import React, { useState, useEffect } from 'react'
import type { Budget } from '@/types'
import { Button } from './ui/button'
import { PageHeader } from './page-header'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu'
import { Plus, ChevronDown, Edit, Trash2 } from 'lucide-react'
import { Spinner } from './ui/spinner'

interface BudgetDisplayProps {
  budgets: Budget[]
  currentBudget: Budget | null
  loading: boolean
  error: string | null
  onAddBudget?: () => void
  onEditBudget?: (budget: Budget) => void
  onDeleteBudget?: (budgetId: string) => void
  onUpdateItem?: (budgetId: string, itemName: string, amount: number) => void
  onDeleteItem?: (budgetId: string, itemName: string) => void
}

export function BudgetDisplay({ budgets, currentBudget, loading, error, onAddBudget, onEditBudget, onDeleteBudget, onUpdateItem, onDeleteItem }: BudgetDisplayProps) {
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null)

  // Auto-select latest budget when budgets change or on initial load
  useEffect(() => {
    if (budgets.length > 0 && !selectedMonth) {
      // Get the latest budget (most recent month)
      const latestBudget = budgets.reduce((latest, budget) => {
        return budget.month > latest.month ? budget : latest
      }, budgets[0])
      
      setSelectedMonth(latestBudget.month)
    }
  }, [budgets, selectedMonth])

  // Auto-select current month if no selection and current budget exists
  useEffect(() => {
    if (!selectedMonth && currentBudget && budgets.length === 0) {
      setSelectedMonth(currentBudget.month)
    }
  }, [currentBudget, selectedMonth, budgets])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spinner size="lg" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mb-3">
            <span className="text-red-600 text-lg">!</span>
          </div>
          <div className="text-gray-600">Something went wrong</div>
        </div>
      </div>
    )
  }

  const availableMonths = budgets.map(b => b.month).sort((a, b) => b.localeCompare(a))
  const displayBudget = selectedMonth ? budgets.find(b => b.month === selectedMonth) : currentBudget

  const formatMonth = (monthString: string) => {
    const date = new Date(monthString + '-01')
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <PageHeader
        availableMonths={availableMonths}
        selectedMonth={selectedMonth}
        onMonthChange={setSelectedMonth}
        buttonText={displayBudget ? "Edit Budget" : "Add Budget"}
        onButtonClick={displayBudget ? () => onEditBudget && onEditBudget(displayBudget) : onAddBudget}
      />

      {/* Main Content */}
      {displayBudget && displayBudget.essentialItems && displayBudget.essentialItems.length > 0 ? (
        <div>
          {/* Total Budget Summary */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 mb-6 border border-blue-100">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-gray-900">Total Budget</h3>
              </div>
              <div className="text-right">
                <div className="text-3xl font-light text-gray-900">
                  {formatCurrency(displayBudget.totalBudget)}
                </div>
              </div>
            </div>
          </div>

          {/* Essential Items List */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="divide-y divide-gray-200">
              {displayBudget.essentialItems
                .slice()
                .sort((a, b) => (b.amount || 0) - (a.amount || 0))
                .map((item, index) => (
                <div key={index} className="px-6 py-6 flex items-center justify-between hover:bg-gray-50 transition-colors">
                  <div className="flex-1">
                    <div className="text-xl font-light text-gray-900">{item.name}</div>
                    <div className="text-sm text-gray-500 mt-1">
                      {item.amount && displayBudget.totalBudget > 0
                        ? `${Math.round((item.amount / displayBudget.totalBudget) * 100)}% of budget`
                        : 'No amount'
                      }
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-light text-gray-900">
                      {item.amount ? formatCurrency(item.amount) : '—'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-6">
            <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.25 7.5l-.625 10.532a2.25 2.25 0 01-1.592.659l-5.433-5.433a2.25 2.25 0 00-3.184 0l-5.433 5.433a2.25 2.25 0 00-1.592.659L3.75 7.5m6 0l5.832-5.832m0 0a2.25 2.25 0 003.184 0l5.433 5.433a2.25 2.25 0 001.592-.659L20.25 7.5" />
            </svg>
          </div>
          <div className="text-center">
            <h3 className="text-xl font-light text-gray-900 mb-2">No essential items</h3>
            <p className="text-gray-500">
              {selectedMonth 
                ? `No items for ${formatMonth(selectedMonth)}`
                : 'Add essential items to your budget'
              }
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
