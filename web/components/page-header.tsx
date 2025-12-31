'use client'

import { Button } from './ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu'
import { ChevronDown, Plus } from 'lucide-react'

interface PageHeaderProps {
  availableMonths?: string[]
  selectedMonth?: string | null
  onMonthChange?: (month: string) => void
  buttonText?: string
  onButtonClick?: () => void
  showButton?: boolean
}

export function PageHeader({
  availableMonths = [],
  selectedMonth,
  onMonthChange,
  buttonText,
  onButtonClick,
  showButton = true
}: PageHeaderProps) {
  const formatMonth = (monthString: string) => {
    const date = new Date(monthString + '-01')
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
  }

  return (
    <div className="flex items-center justify-between">
      {/* Left: Month Dropdown */}
      <div className="flex items-center gap-3">
        {availableMonths.length > 0 && onMonthChange && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="h-10 px-4 py-2 text-sm flex items-center justify-between min-w-[140px]">
                <span className="truncate">
                  {selectedMonth ? formatMonth(selectedMonth) : 'Select Month'}
                </span>
                <ChevronDown className="w-4 h-4 ml-2 flex-shrink-0" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48">
              {availableMonths.map(month => (
                <DropdownMenuItem 
                  key={month} 
                  onClick={() => onMonthChange(month)}
                  className={`cursor-pointer ${
                    selectedMonth === month ? 'bg-accent text-accent-foreground' : ''
                  }`}
                >
                  {formatMonth(month)}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {/* Center: Empty space for balance */}
      <div className="flex-1"></div>
      
      {/* Right: Action Button */}
      <div className="flex items-center gap-3">
        {showButton && buttonText && onButtonClick && (
          <Button
            onClick={onButtonClick}
            className="hidden md:block h-10"
            style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '0.5rem',
              whiteSpace: 'nowrap'
            }}
          >
            <Plus className="w-4 h-4 flex-shrink-0" />
            <span>{buttonText}</span>
          </Button>
        )}
      </div>
    </div>
  )
}
