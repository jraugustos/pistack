'use client'

import { useState, useEffect, useRef } from 'react'
import { Check, X } from 'lucide-react'

interface EditableFieldProps {
  value: string
  onSave: (value: string) => void
  multiline?: boolean
  className?: string
  placeholder?: string
  isEditing: boolean
  onStartEdit: () => void
  onCancelEdit: () => void
}

export function EditableField({
  value,
  onSave,
  multiline = false,
  className = '',
  placeholder = 'Clique para editar',
  isEditing,
  onStartEdit,
  onCancelEdit,
}: EditableFieldProps) {
  const [localValue, setLocalValue] = useState(value)
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null)

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isEditing])

  useEffect(() => {
    setLocalValue(value)
  }, [value])

  const handleSave = () => {
    if (localValue.trim()) {
      onSave(localValue)
    } else {
      setLocalValue(value)
      onCancelEdit()
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !multiline) {
      e.preventDefault()
      handleSave()
    }
    if (e.key === 'Escape') {
      setLocalValue(value)
      onCancelEdit()
    }
    if (e.key === 'Enter' && e.metaKey && multiline) {
      handleSave()
    }
  }

  if (!isEditing) {
    return (
      <div
        onClick={onStartEdit}
        className={`cursor-text hover:bg-white/5 rounded px-1 -mx-1 transition-colors ${className}`}
      >
        {value || <span className="text-[#E6E9F2]/40">{placeholder}</span>}
      </div>
    )
  }

  const commonProps = {
    ref: inputRef as any,
    value: localValue,
    onChange: (e: any) => setLocalValue(e.target.value),
    onKeyDown: handleKeyDown,
    onBlur: handleSave,
    className: `w-full bg-white/10 border border-[#7AA2FF]/50 rounded px-2 py-1 focus:outline-none focus:border-[#7AA2FF] ${className}`,
    placeholder,
  }

  return (
    <div className="relative">
      {multiline ? (
        <textarea {...commonProps} rows={3} />
      ) : (
        <input type="text" {...commonProps} />
      )}
      <div className="absolute right-1 top-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={handleSave}
          className="p-1 bg-[#5AD19A]/20 hover:bg-[#5AD19A]/30 rounded"
        >
          <Check className="w-3 h-3 text-[#5AD19A]" />
        </button>
        <button
          onClick={() => {
            setLocalValue(value)
            onCancelEdit()
          }}
          className="p-1 bg-[#FF6B6B]/20 hover:bg-[#FF6B6B]/30 rounded"
        >
          <X className="w-3 h-3 text-[#FF6B6B]" />
        </button>
      </div>
    </div>
  )
}
