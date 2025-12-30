'use client'

import { useState, useEffect, useRef } from 'react'
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
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (value && !categories.includes(value)) {
      setCustomValue(value)
    }
  }, [value, categories])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value
    setCustomValue(inputValue)
    onChange(inputValue)

    if (inputValue.trim()) {
      const filtered = categories.filter(cat => 
        cat.toLowerCase().includes(inputValue.toLowerCase())
      )
      setFilteredCategories(filtered)
      setShowSuggestions(filtered.length > 0)
    } else {
      setShowSuggestions(false)
      setFilteredCategories([])
    }
  }

  const handleInputFocus = () => {
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
    const handleClick = (event: MouseEvent) => {
      if (inputRef.current && !inputRef.current.contains(event.target as Node)) {
        handleClickOutside()
      }
    }

    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

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
        
        {showSuggestions && filteredCategories.length > 0 && (
          <div className="absolute top-11 left-0 right-0 z-50 bg-background border border-border rounded-md shadow-lg max-h-48 overflow-y-auto">
            {filteredCategories.map((category) => (
              <div
                key={category}
                className="px-3 py-2 hover:bg-muted cursor-pointer text-sm"
                onClick={() => handleSuggestionClick(category)}
              >
                {category}
              </div>
            ))}
            
            {customValue.trim() && !categories.includes(customValue.trim()) && (
              <div className="border-t border-border">
                <div
                  className="px-3 py-2 hover:bg-muted cursor-pointer text-sm text-blue-600"
                  onClick={handleAddCustom}
                >
                  + Add "{customValue.trim()}"
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
