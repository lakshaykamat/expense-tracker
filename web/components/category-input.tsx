'use client'

import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Button } from './ui/button'
import { X } from 'lucide-react'

interface CategoryInputProps {
  value?: string
  onChange: (value: string) => void
  categories: string[]
  onAddCategory: (category: string) => void
}

export function CategoryInput({ value, onChange, categories, onAddCategory }: CategoryInputProps) {
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [filteredCategories, setFilteredCategories] = useState<string[]>([])
  const [customValue, setCustomValue] = useState('')
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 })
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (value && !categories.includes(value)) {
      setCustomValue(value)
    }
  }, [value, categories])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value
    setCustomValue(inputValue)
    onChange(inputValue)
    updateDropdownPosition()

    if (inputValue.trim()) {
      const filtered = categories.filter(cat => 
        cat.toLowerCase().includes(inputValue.toLowerCase())
      )
      setFilteredCategories(filtered)
      setShowSuggestions(filtered.length > 0)
    } else {
      setFilteredCategories(categories)
      setShowSuggestions(true)
    }
  }

  const updateDropdownPosition = () => {
    if (inputRef.current) {
      const rect = inputRef.current.getBoundingClientRect()
      setDropdownPosition({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width
      })
    }
  }

  const handleInputFocus = () => {
    updateDropdownPosition()
    if (customValue.trim()) {
      const filtered = categories.filter(cat => 
        cat.toLowerCase().includes(customValue.toLowerCase())
      )
      setFilteredCategories(filtered)
      setShowSuggestions(filtered.length > 0)
    } else {
      setFilteredCategories(categories)
      setShowSuggestions(true)
    }
  }

  const handleSuggestionClick = (category: string) => {
    setCustomValue(category)
    onChange(category)
    setShowSuggestions(false)
    setFilteredCategories([])
  }

  const handleAddCustom = () => {
    if (customValue.trim() && !categories.includes(customValue.trim())) {
      onAddCategory(customValue.trim())
      onChange(customValue.trim())
      setCustomValue('')
      setShowSuggestions(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setShowSuggestions(false)
      setFilteredCategories([])
    }
  }

  const handleClickOutside = () => {
    setShowSuggestions(false)
    setFilteredCategories([])
  }

  useEffect(() => {
    if (showSuggestions) {
      updateDropdownPosition()
    }
  }, [showSuggestions])

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      const target = event.target as Node
      const isClickInsideInput = inputRef.current?.contains(target)
      const isClickInsideDropdown = dropdownRef.current?.contains(target)
      
      if (!isClickInsideInput && !isClickInsideDropdown) {
        handleClickOutside()
      }
    }

    const handleScroll = () => {
      if (showSuggestions) {
        updateDropdownPosition()
      }
    }

    const handleResize = () => {
      if (showSuggestions) {
        updateDropdownPosition()
      }
    }

    document.addEventListener('mousedown', handleClick)
    window.addEventListener('scroll', handleScroll, true)
    window.addEventListener('resize', handleResize)
    
    return () => {
      document.removeEventListener('mousedown', handleClick)
      window.removeEventListener('scroll', handleScroll, true)
      window.removeEventListener('resize', handleResize)
    }
  }, [showSuggestions])

  const hasContent = filteredCategories.length > 0 || (customValue.trim() && !categories.includes(customValue.trim()))
  
  const handleDropdownClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
  }
  
  const handleCategoryClick = (category: string, e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    handleSuggestionClick(category)
  }
  
  const handleAddClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    handleAddCustom()
  }
  
  const dropdownContent = showSuggestions && hasContent && (
    <div
      ref={dropdownRef}
      className="fixed z-[100] bg-background border border-border rounded-md shadow-lg max-h-48 overflow-y-auto"
      style={{
        top: `${dropdownPosition.top}px`,
        left: `${dropdownPosition.left}px`,
        width: `${dropdownPosition.width}px`
      }}
      onClick={handleDropdownClick}
      onMouseDown={(e) => {
        e.stopPropagation()
        e.preventDefault()
      }}
    >
      {filteredCategories.map((category) => (
        <div
          key={category}
          className="px-3 py-2 hover:bg-muted cursor-pointer text-sm"
          onClick={(e) => handleCategoryClick(category, e)}
          onMouseDown={(e) => {
            e.stopPropagation()
            e.preventDefault()
          }}
        >
          {category}
        </div>
      ))}
      
      {customValue.trim() && !categories.includes(customValue.trim()) && (
        <div className={filteredCategories.length > 0 ? "border-t border-border" : ""}>
          <div
            className="px-3 py-2 hover:bg-muted cursor-pointer text-sm text-blue-600"
            onClick={handleAddClick}
            onMouseDown={(e) => {
              e.stopPropagation()
              e.preventDefault()
            }}
          >
            + Add "{customValue.trim()}"
          </div>
        </div>
      )}
    </div>
  )

  return (
    <div className="space-y-1">
      <div className="relative">
        <Input
          ref={inputRef}
          value={customValue}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onKeyDown={handleKeyDown}
          placeholder="Type or select category"
          className="h-10"
        />
      </div>
      {typeof window !== 'undefined' && dropdownContent && createPortal(dropdownContent, document.body)}
    </div>
  )
}
