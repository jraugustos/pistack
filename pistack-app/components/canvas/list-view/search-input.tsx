'use client'

import { useState, useEffect } from 'react'
import { Search, X } from 'lucide-react'

interface SearchInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

export function SearchInput({
  value,
  onChange,
  placeholder = 'Buscar cards...',
  className = '',
}: SearchInputProps) {
  const [localValue, setLocalValue] = useState(value)

  // Sync with external value
  useEffect(() => {
    setLocalValue(value)
  }, [value])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setLocalValue(newValue)
    onChange(newValue)
  }

  const handleClear = () => {
    setLocalValue('')
    onChange('')
  }

  return (
    <div className={`relative ${className}`}>
      <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
        <Search className="w-4 h-4 text-[#E6E9F2]/40" />
      </div>

      <input
        type="text"
        value={localValue}
        onChange={handleChange}
        placeholder={placeholder}
        className="w-full pl-10 pr-10 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-[#E6E9F2] placeholder:text-[#E6E9F2]/40 focus:outline-none focus:ring-2 focus:ring-[#7AA2FF]/50 focus:border-[#7AA2FF]/50 transition-colors"
      />

      {localValue && (
        <button
          onClick={handleClear}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-[#E6E9F2]/40 hover:text-[#E6E9F2] hover:bg-white/5 rounded transition-colors"
          title="Limpar busca"
          aria-label="Limpar busca"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  )
}
