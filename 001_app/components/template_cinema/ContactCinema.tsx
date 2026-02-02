'use client'

import { motion, useInView } from 'framer-motion'
import { useRef, useState } from 'react'

interface SocialLink {
  id: string
  platform: string
  url: string
  icon: string
}

interface ContactCinemaProps {
  data: {
    email: string
    address?: string
    mapEmbed?: string
    phone?: string
    socialLinks?: SocialLink[]
  }
  theme: {
    primary: string
    accent: string
    text: string
  }
}

export function ContactCinema({ data, theme }: ContactCinemaProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Form submitted:', formData)
    // TODO: Implement actual form submission
    alert('Message envoyé ! (mock pour le moment)')
    setFormData({ name: '', email: '', message: '' })
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  return (
    <section
      id="contact"
      ref={ref}
      className="py-20 lg:py-32"
      style={{ backgroundColor: theme.primary }}
    >
      <div className="container mx-auto px-4 lg:px-8">
        {/* Title - Centré avec soulignement court */}
        <div className="text-center mb-16 lg:mb-20">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="text-4xl lg:text-5xl font-bold mb-4"
            style={{ color: theme.accent }}
          >
            Contact
          </motion.h2>
          <motion.div
            initial={{ opacity: 0, scaleX: 0 }}
            animate={isInView ? { opacity: 1, scaleX: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="w-16 h-1 mx-auto"
            style={{ backgroundColor: theme.accent }}
          />
        </div>

        {/* Content Grid */}
        <div className="flex justify-center">
          {/* Left: Contact Info + Form */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="space-y-8 max-w-md text-center"
          >
            {/* Contact Info */}
            <div className="space-y-4">
              <a
                href={`mailto:${data.email}`}
                className="block text-lg lg:text-xl hover:opacity-70 transition-opacity"
                style={{ color: theme.accent }}
              >
                {data.email}
              </a>
              {data.address && (
                <p
                  className="text-base lg:text-lg"
                  style={{ color: theme.text }}
                >
                  {data.address}
                </p>
              )}
              {data.phone && (
                <a
                  href={`tel:${data.phone}`}
                  className="block text-base lg:text-lg hover:opacity-70 transition-opacity"
                  style={{ color: theme.text }}
                >
                  {data.phone}
                </a>
              )}

              {/* Social Links */}
              {data.socialLinks && data.socialLinks.length > 0 && (
                <div className="flex justify-center gap-5 pt-4">
                  {data.socialLinks.map((link) => (
                    <div key={link.id} className="group relative">
                      <motion.a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block hover:opacity-80 transition-opacity"
                        whileHover={{ scale: 1.15 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {link.icon ? (
                          <img
                            src={link.icon}
                            alt={link.platform}
                            className="w-10 h-10 object-contain"
                          />
                        ) : (
                          <span
                            className="inline-flex items-center justify-center w-12 h-12 rounded-full border text-sm font-medium"
                            style={{ borderColor: theme.accent, color: theme.accent }}
                          >
                            {link.platform.substring(0, 2).toUpperCase()}
                          </span>
                        )}
                      </motion.a>
                      {/* Tooltip */}
                      <span
                        className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-1 text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none"
                        style={{ backgroundColor: theme.accent, color: theme.primary }}
                      >
                        {link.platform}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Form and Map commented out - only showing contact info */}
          </motion.div>
        </div>
      </div>
    </section>
  )
}
