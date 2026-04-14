'use client'

export const PRESET_COLORS = [
  { value: '#ef4444', label: '빨강' },
  { value: '#f97316', label: '주황' },
  { value: '#eab308', label: '노랑' },
  { value: '#22c55e', label: '초록' },
  { value: '#3b82f6', label: '파랑' },
  { value: '#8b5cf6', label: '보라' },
  { value: '#ec4899', label: '분홍' },
  { value: '#6b7280', label: '회색' },
]

export default function ColorPicker({
  value,
  onChange,
}: {
  value: string
  onChange: (color: string) => void
}) {
  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {PRESET_COLORS.map(({ value: colorValue, label }) => (
        <button
          key={colorValue}
          type="button"
          onClick={() => onChange(colorValue)}
          className="h-7 w-7 rounded-full transition-transform active:scale-90"
          style={{ backgroundColor: colorValue, outline: value === colorValue ? `3px solid ${colorValue}` : 'none', outlineOffset: '2px' }}
          aria-label={label}
        />
      ))}
      {/* 커스텀 컬러 */}
      <label className="relative h-7 w-7 cursor-pointer rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden">
        <span className="text-gray-400 text-xs">+</span>
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
        />
      </label>
    </div>
  )
}
