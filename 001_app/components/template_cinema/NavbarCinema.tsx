/**
 * NAVBAR COMPONENT - Template Cinema
 * Fixed navigation bar with smooth scrolling to sections
 */

'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useLanguage } from '@/contexts/LanguageContext'
import { getUITranslation } from '@/lib/i18n/ui-translations'

interface NavbarCinemaProps {
  theme: {
    primary: string
    accent: string
    text: string
  }
  logo?: string
}

export function NavbarCinema({ theme, logo }: NavbarCinemaProps) {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { language, setLanguage } = useLanguage()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      // Fermer le menu d'abord
      setIsMobileMenuOpen(false)

      // Attendre que le menu se ferme avant de scroller
      setTimeout(() => {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 300)
    }
  }

  const navItems = [
    { labelKey: 'home' as const, id: 'home' },
    { labelKey: 'about' as const, id: 'about' },
    { labelKey: 'films' as const, id: 'films' },
    { labelKey: 'contact' as const, id: 'contact' },
  ]

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'shadow-lg' : ''
      }`}
      style={{
        backgroundColor: isScrolled
          ? theme.primary
          : 'rgba(10, 10, 10, 0.3)',
        backdropFilter: isScrolled ? 'none' : 'blur(10px)',
      }}
    >
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <motion.div
            className="cursor-pointer"
            onClick={() => scrollToSection('home')}
            whileHover={{ scale: 1.05 }}
          >
            {logo?.startsWith('http') || logo?.startsWith('/') ? (
              <img
                src={logo}
                alt="Logo"
                className="h-12 w-auto object-contain"
              />
            ) : (
              <div className="text-2xl font-bold tracking-tight" style={{ color: theme.accent }}>
                {logo || 'CINEMA'}
              </div>
            )}
          </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className="text-sm font-light tracking-wide transition-all duration-300 hover:opacity-70"
                style={{ color: theme.text }}
              >
                {getUITranslation(item.labelKey, language)}
              </button>
            ))}

            {/* Language Selector */}
            <div className="flex items-center gap-2 ml-4 border-l pl-4" style={{ borderColor: `${theme.accent}40` }}>
              <button
                onClick={() => setLanguage('fr')}
                className={`text-sm font-light tracking-wide transition-all duration-300 ${
                  language === 'fr' ? 'opacity-100 font-semibold' : 'opacity-50 hover:opacity-70'
                }`}
                style={{ color: theme.text }}
              >
                FR
              </button>
              <span style={{ color: theme.accent }}>|</span>
              <button
                onClick={() => setLanguage('en')}
                className={`text-sm font-light tracking-wide transition-all duration-300 ${
                  language === 'en' ? 'opacity-100 font-semibold' : 'opacity-50 hover:opacity-70'
                }`}
                style={{ color: theme.text }}
              >
                EN
              </button>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden flex flex-col space-y-1.5 p-2"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <motion.span
              className="w-6 h-0.5"
              style={{ backgroundColor: theme.accent }}
              animate={{ rotate: isMobileMenuOpen ? 45 : 0, y: isMobileMenuOpen ? 8 : 0 }}
            />
            <motion.span
              className="w-6 h-0.5"
              style={{ backgroundColor: theme.accent }}
              animate={{ opacity: isMobileMenuOpen ? 0 : 1 }}
            />
            <motion.span
              className="w-6 h-0.5"
              style={{ backgroundColor: theme.accent }}
              animate={{ rotate: isMobileMenuOpen ? -45 : 0, y: isMobileMenuOpen ? -8 : 0 }}
            />
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{
          height: isMobileMenuOpen ? 'auto' : 0,
          opacity: isMobileMenuOpen ? 1 : 0,
        }}
        transition={{ duration: 0.3 }}
        className="md:hidden overflow-hidden"
        style={{ backgroundColor: theme.primary }}
      >
        <div className="px-4 py-6 space-y-4">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => scrollToSection(item.id)}
              className="block w-full text-left text-base font-light tracking-wide py-2 transition-all duration-300 hover:opacity-70"
              style={{ color: theme.text }}
            >
              {getUITranslation(item.labelKey, language)}
            </button>
          ))}

          {/* Mobile Language Selector */}
          <div className="flex items-center gap-3 pt-4 border-t" style={{ borderColor: `${theme.accent}40` }}>
            <span className="text-sm" style={{ color: theme.text }}>{getUITranslation('selectLanguage', language)}:</span>
            <button
              onClick={() => {
                setLanguage('fr')
                setIsMobileMenuOpen(false)
              }}
              className={`text-sm px-3 py-1 rounded transition-all duration-300 ${
                language === 'fr' ? 'font-semibold' : 'opacity-50'
              }`}
              style={{
                color: theme.text,
                backgroundColor: language === 'fr' ? `${theme.accent}20` : 'transparent'
              }}
            >
              FR
            </button>
            <button
              onClick={() => {
                setLanguage('en')
                setIsMobileMenuOpen(false)
              }}
              className={`text-sm px-3 py-1 rounded transition-all duration-300 ${
                language === 'en' ? 'font-semibold' : 'opacity-50'
              }`}
              style={{
                color: theme.text,
                backgroundColor: language === 'en' ? `${theme.accent}20` : 'transparent'
              }}
            >
              EN
            </button>
          </div>
        </div>
      </motion.div>
    </motion.nav>
  )
}
