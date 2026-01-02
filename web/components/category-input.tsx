'use client'

import * as React from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select'

interface CategoryInputProps {
  value?: string
  onChange: (value: string) => void
  categories: string[]
}

export function CategoryInput({ value = '', onChange, categories }: CategoryInputProps) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="h-11! w-full">
        <SelectValue placeholder="Select category" />
      </SelectTrigger>
      <SelectContent>
        {categories.map((category) => (
          <SelectItem key={category} value={category}>
            {category}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
