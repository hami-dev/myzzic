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
    <select
      className={`w-full ${baseClassName}${className ? ` ${className}` : ''}`}
      {...props}
    >
      {children}
    </select>
  )
}
