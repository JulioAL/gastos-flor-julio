'use client'

import { createContext, useContext, useEffect, useState } from 'react'

type Theme = 'system' | 'light' | 'dark'
export type ColorTheme = 'durazno' | 'menta' | 'lavanda' | 'cielo' | 'rosa'

export const COLOR_THEMES: { id: ColorTheme; label: string; swatch: string }[] = [
  { id: 'durazno', label: 'Durazno', swatch: 'oklch(62% 0.14 50)' },
  { id: 'menta',   label: 'Menta',   swatch: 'oklch(56% 0.13 160)' },
  { id: 'lavanda', label: 'Lavanda', swatch: 'oklch(58% 0.14 290)' },
  { id: 'cielo',   label: 'Cielo',   swatch: 'oklch(57% 0.13 225)' },
  { id: 'rosa',    label: 'Rosa',    swatch: 'oklch(60% 0.14 345)' },
]

const ThemeContext = createContext<{
  theme: Theme
  isDark: boolean
  setTheme: (t: Theme) => void
  colorTheme: ColorTheme
  setColorTheme: (c: ColorTheme) => void
}>({
  theme: 'system',
  isDark: false,
  setTheme: () => {},
  colorTheme: 'durazno',
  setColorTheme: () => {},
})

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('system')
  const [isDark, setIsDark] = useState(false)
  const [colorTheme, setColorThemeState] = useState<ColorTheme>('durazno')

  function applyTheme(t: Theme) {
    const root = document.documentElement
    if (t === 'dark') {
      root.classList.add('dark')
      setIsDark(true)
    } else if (t === 'light') {
      root.classList.remove('dark')
      setIsDark(false)
    } else {
      const dark = typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches
      root.classList.toggle('dark', dark)
      setIsDark(dark)
    }
  }

  useEffect(() => {
    try {
      const saved = localStorage.getItem('theme') as Theme | null
      const initial = saved ?? 'system'
      const savedColor = (localStorage.getItem('gfj-theme') as ColorTheme | null) ?? 'durazno'

      /* eslint-disable react-hooks/set-state-in-effect */
      setThemeState(initial)
      setColorThemeState(savedColor)
      /* eslint-enable react-hooks/set-state-in-effect */

      applyTheme(initial)
      document.documentElement.setAttribute('data-theme', savedColor)
    } catch (e) {
      console.error('Failed to load theme from localStorage:', e)
      applyTheme('system')
    }
  }, [])

  useEffect(() => {
    if (theme !== 'system') return
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = (e: MediaQueryListEvent) => {
      document.documentElement.classList.toggle('dark', e.matches)
      setIsDark(e.matches)
    }
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [theme])


  function setTheme(t: Theme) {
    setThemeState(t)
    try {
      localStorage.setItem('theme', t)
    } catch (e) {
      console.error('Failed to save theme to localStorage:', e)
    }
    applyTheme(t)
  }

  function setColorTheme(c: ColorTheme) {
    setColorThemeState(c)
    try {
      localStorage.setItem('gfj-theme', c)
    } catch (e) {
      console.error('Failed to save color theme to localStorage:', e)
    }
    document.documentElement.setAttribute('data-theme', c)
  }

  return (
    <ThemeContext.Provider value={{ theme, isDark, setTheme, colorTheme, setColorTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)
