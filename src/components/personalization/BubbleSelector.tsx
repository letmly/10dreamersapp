'use client'

import { useState } from 'react'
import type { BubbleOption } from '@/types/personalization'

interface BubbleSelectorProps {
  options: BubbleOption[]
  selected: string | string[]
  onChange: (value: string | string[]) => void
  multiple?: boolean
  maxSelections?: number
}

export default function BubbleSelector({
  options,
  selected,
  onChange,
  multiple = false,
  maxSelections,
}: BubbleSelectorProps) {
  const selectedArray = Array.isArray(selected) ? selected : [selected]

  const handleSelect = (value: string) => {
    if (multiple) {
      const currentSelected = selectedArray
      const isSelected = currentSelected.includes(value)

      let newSelected: string[]
      if (isSelected) {
        // Убираем из выбранных
        newSelected = currentSelected.filter((v) => v !== value)
      } else {
        // Добавляем в выбранные
        if (maxSelections && currentSelected.length >= maxSelections) {
          // Заменяем последний выбор
          newSelected = [...currentSelected.slice(0, maxSelections - 1), value]
        } else {
          newSelected = [...currentSelected, value]
        }
      }

      onChange(newSelected)
    } else {
      onChange(value)
    }
  }

  const isSelected = (value: string) => selectedArray.includes(value)

  return (
    <div className="space-y-4">
      {/* Счетчик для multiple */}
      {multiple && maxSelections && (
        <div className="text-sm text-gray-600 text-center">
          Выбрано: {selectedArray.length} / {maxSelections}
        </div>
      )}

      {/* Bubbles grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {options.map((option) => {
          const selected = isSelected(option.value)

          return (
            <button
              key={option.value}
              onClick={() => handleSelect(option.value)}
              className={`
                relative flex flex-col items-center justify-center
                p-4 rounded-2xl border-2 transition-all
                active:scale-95 min-h-[100px]
                ${
                  selected
                    ? 'border-blue-500 bg-blue-50 shadow-lg shadow-blue-200'
                    : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
                }
              `}
              style={
                selected && option.color
                  ? {
                      borderColor: option.color,
                      backgroundColor: `${option.color}15`,
                    }
                  : {}
              }
            >
              {/* Галочка для выбранных */}
              {selected && (
                <div className="absolute top-2 right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}

              {/* Emoji */}
              {option.emoji && <div className="text-3xl mb-2">{option.emoji}</div>}

              {/* Label */}
              <div className="text-sm font-medium text-center text-gray-900">
                {option.label}
              </div>

              {/* Description */}
              {option.description && (
                <div className="text-xs text-gray-500 text-center mt-1 line-clamp-2">
                  {option.description}
                </div>
              )}
            </button>
          )
        })}
      </div>

      {/* Выбранные опции (теги) */}
      {multiple && selectedArray.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-2">
          {selectedArray.map((value) => {
            const option = options.find((o) => o.value === value)
            if (!option) return null

            return (
              <div
                key={value}
                className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
              >
                {option.emoji && <span>{option.emoji}</span>}
                <span>{option.label}</span>
                <button
                  onClick={() => handleSelect(value)}
                  className="ml-1 hover:text-blue-900"
                >
                  ×
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
