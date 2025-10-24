'use client'

import { useState, useEffect, useRef } from 'react'

interface QuickSuggestion {
  icon: string
  text: string
}

interface QuickSuggestionsCarouselProps {
  suggestions: QuickSuggestion[]
  onSelect: (text: string) => void
  stageColor: string
  isLoading?: boolean
}

export function QuickSuggestionsCarousel({
  suggestions,
  onSelect,
  stageColor,
  isLoading = false,
}: QuickSuggestionsCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const autoplayRef = useRef<NodeJS.Timeout | null>(null)
  const hasInteracted = useRef(false)

  if (suggestions.length === 0) {
    return null
  }

  const currentSuggestion = suggestions[currentIndex]
  const showDots = suggestions.length > 1

  // Autoplay: avança para a próxima sugestão a cada 5 segundos
  useEffect(() => {
    if (suggestions.length <= 1 || isLoading || hasInteracted.current) {
      return
    }

    autoplayRef.current = setInterval(() => {
      setIsTransitioning(true)
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % suggestions.length)
        setIsTransitioning(false)
      }, 300)
    }, 5000)

    return () => {
      if (autoplayRef.current) {
        clearInterval(autoplayRef.current)
      }
    }
  }, [suggestions.length, isLoading, currentIndex])

  const handleDotClick = (index: number) => {
    if (index === currentIndex || isLoading) return

    // Marca que o usuário interagiu (pausa autoplay)
    hasInteracted.current = true
    if (autoplayRef.current) {
      clearInterval(autoplayRef.current)
    }

    // Animação de transição
    setIsTransitioning(true)
    setTimeout(() => {
      setCurrentIndex(index)
      setIsTransitioning(false)
    }, 300)
  }

  const handleSuggestionClick = () => {
    // Pausa autoplay ao clicar na sugestão
    hasInteracted.current = true
    if (autoplayRef.current) {
      clearInterval(autoplayRef.current)
    }
    onSelect(currentSuggestion.text)
  }

  return (
    <div className="px-4 py-3 border-t border-white/5">
      <div className="text-xs font-medium text-[#E6E9F2]/40 mb-2">
        Sugestões rápidas:
      </div>

      {/* Sugestão atual com animação */}
      <div className="relative overflow-hidden">
        <button
          onClick={handleSuggestionClick}
          disabled={isLoading}
          className="w-full text-left px-3 py-2 text-xs border rounded-lg flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
          style={{
            backgroundColor: `${stageColor}08`,
            borderColor: `${stageColor}30`,
            opacity: isTransitioning ? 0 : 1,
            transform: isTransitioning ? 'translateY(-10px)' : 'translateY(0)',
          }}
        >
          <span className="text-base flex-shrink-0">{currentSuggestion.icon}</span>
          <span className="text-[#E6E9F2]/80 leading-relaxed">
            {currentSuggestion.text}
          </span>
        </button>
      </div>

      {/* Dots de navegação */}
      {showDots && (
        <div className="flex justify-center gap-1.5 mt-2.5">
          {suggestions.map((_, i) => (
            <button
              key={i}
              onClick={() => handleDotClick(i)}
              disabled={isLoading}
              className="transition-all duration-300 disabled:cursor-not-allowed hover:scale-125"
              style={{
                width: i === currentIndex ? '16px' : '6px',
                height: '6px',
                borderRadius: i === currentIndex ? '3px' : '50%',
                backgroundColor: i === currentIndex ? stageColor : `${stageColor}30`,
              }}
              aria-label={`Ir para sugestão ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
