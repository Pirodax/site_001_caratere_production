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
            </div>

            {/* Form and Map commented out - only showing contact info */}
          </motion.div>
        </div>
      </div>
    </section>
  )
}
