'use client'

export const PRESET_COLORS = [
  { value: '#F2B8A2', label: '살몬' },
  { value: '#D4B896', label: '골드' },
  { value: '#B0C4DE', label: '연파랑' },
  { value: '#B5C9A8', label: '연초록' },
  { value: '#C3B1D6', label: '라벤더' },
  { value: '#D6A5B8', label: '핑크' },
  { value: '#B8A99A', label: '베이지' },
  { value: '#7A7368', label: '다크브라운' },
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
