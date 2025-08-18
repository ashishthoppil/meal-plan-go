import React from 'react'
import Hero from '@/app/components/Home/Hero'
import Features from '@/app/components/Home/Features'
import Newsletter from '@/app/components/Home/Newsletter'
import { Metadata } from 'next'
import { ToastContainer } from 'react-toastify';
import ContactForm from './components/Contact/Form'

export const metadata: Metadata = {
  title: 'MealPlanGo',
}

export default function Home() {
  return (
    <main>
      <Hero />
      <ContactForm />
      <Features />
      <Newsletter />
      <ToastContainer />
    </main>
  )
}
