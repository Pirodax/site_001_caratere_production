'use client'

import { motion, useInView } from 'framer-motion'
import { useRef, useState } from 'react'

interface ContactCinemaProps {
  data: {
    email: string
    address?: string
    mapEmbed?: string
    phone?: string
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
        {/* Title */}
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-4xl lg:text-5xl font-bold mb-16 lg:mb-20"
          style={{ color: theme.accent }}
        >
          Contact
        </motion.h2>

        {/* Content Grid */}
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
          {/* Left: Contact Info + Form */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="space-y-8"
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
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6 mt-12">
              <div>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Nom"
                  required
                  className="w-full px-4 py-3 bg-transparent border-b-2 focus:outline-none transition-colors"
                  style={{
                    borderColor: theme.text,
                    color: theme.text,
                  }}
                />
              </div>

              <div>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Email"
                  required
                  className="w-full px-4 py-3 bg-transparent border-b-2 focus:outline-none transition-colors"
                  style={{
                    borderColor: theme.text,
                    color: theme.text,
                  }}
                />
              </div>

              <div>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Message"
                  required
                  rows={5}
                  className="w-full px-4 py-3 bg-transparent border-b-2 focus:outline-none transition-colors resize-none"
                  style={{
                    borderColor: theme.text,
                    color: theme.text,
                  }}
                />
              </div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="submit"
                className="px-8 py-4 text-sm lg:text-base font-semibold tracking-wide transition-all duration-300 border-2"
                style={{
                  color: theme.text,
                  borderColor: theme.accent,
                  backgroundColor: 'transparent',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = theme.accent
                  e.currentTarget.style.color = theme.primary
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent'
                  e.currentTarget.style.color = theme.text
                }}
              >
                Envoyer
              </motion.button>
            </form>
          </motion.div>

          {/* Right: Map */}
          {data.mapEmbed && (
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="relative h-96 lg:h-full min-h-[400px]"
            >
              <iframe
                src={data.mapEmbed}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="grayscale hover:grayscale-0 transition-all duration-500"
              />
            </motion.div>
          )}
        </div>
      </div>
    </section>
  )
}
