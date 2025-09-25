'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

interface ThemeContextType {
  logoType: 'text' | 'image'
  textLogo: string
  logoImage: string | null
  colorTheme: string
  setLogoType: (type: 'text' | 'image') => void
  setTextLogo: (text: string) => void
  setLogoImage: (image: string | null) => void
  setColorTheme: (theme: string) => void
  saveThemeSettings: () => void
  loadThemeSettings: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [logoType, setLogoType] = useState<'text' | 'image'>('text')
  const [textLogo, setTextLogo] = useState('tripfeels')
  const [logoImage, setLogoImage] = useState<string | null>(null)
  const [colorTheme, setColorTheme] = useState('blue')

  // Load theme settings from localStorage on mount
  useEffect(() => {
    loadThemeSettings()
  }, [])

  // Auto-save theme settings when colorTheme changes
  useEffect(() => {
    if (colorTheme) {
      saveThemeSettings()
    }
  }, [colorTheme, logoType, textLogo, logoImage])

  const loadThemeSettings = () => {
    try {
      const saved = localStorage.getItem('tripfeels-theme-settings')
      if (saved) {
        const settings = JSON.parse(saved)
        setLogoType(settings.logoType || 'text')
        setTextLogo(settings.textLogo || 'tripfeels')
        setLogoImage(settings.logoImage || null)
        setColorTheme(settings.colorTheme || 'blue')
      }
    } catch (error) {
      console.error('Error loading theme settings:', error)
    }
  }

  const saveThemeSettings = () => {
    try {
      const settings = {
        logoType,
        textLogo,
        logoImage,
        colorTheme
      }
      localStorage.setItem('tripfeels-theme-settings', JSON.stringify(settings))
    } catch (error) {
      console.error('Error saving theme settings:', error)
    }
  }

  return (
    <ThemeContext.Provider
      value={{
        logoType,
        textLogo,
        logoImage,
        colorTheme,
        setLogoType,
        setTextLogo,
        setLogoImage,
        setColorTheme,
        saveThemeSettings,
        loadThemeSettings
      }}
    >
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
