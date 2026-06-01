import type { InputHTMLAttributes, SelectHTMLAttributes } from 'react'

const baseClassName =
  'rounded-xl border border-white/60 bg-white/70 px-4 py-3 text-sm text-gray-800 placeholder-gray-400 backdrop-blur-sm focus:border-accent focus:outline-none'

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={`w-full ${baseClassName}${className ? ` ${className}` : ''}`}
      {...props}
    />
  )
}

export function Select({ className, children, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className={`relative${className ? ` ${className}` : ''}`}>
      <select
        className={`w-full appearance-none pr-10 ${baseClassName}`}
        {...props}
      >
        {children}
      </select>
      <svg
        className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
      </svg>
    </div>
  )
}
