'use client'
import Image from 'next/image'
import React from 'react'
import { useState, useEffect } from 'react'
import { toast } from 'react-toastify'

const ContactForm = () => {
  const [formData, setFormData] = useState({
    email: '',
    diet: '',
    people: '1',
    cuisine: '',
    note: '',
  })
  const [submitted, setSubmitted] = useState(false)
  const [showThanks, setShowThanks] = useState(false)
  const [loader, setLoader] = useState(false)
  const [isFormValid, setIsFormValid] = useState(false)

  useEffect(() => {
    if (formData.email !== '' && formData.diet !== '') {
      setIsFormValid(true)
    } else {
      setIsFormValid(false)
    }
  }, [formData])

  const handleChange = (e: any) => {
    const { name, value } = e.target
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }))
  }
  const reset = () => {
    formData.email = ''
    formData.diet = ''
    formData.people = ''
    formData.cuisine = ''
    formData.note = ''
  }
  const handleSubmit = async (e: any) => {
    e.preventDefault()
    setLoader(true)

    const res = await fetch('/api/generate-plan', {
      method: 'POST',
      body: JSON.stringify({
          email: formData.email,
          diet: formData.diet,
          people: formData.people,
          cuisine: formData.cuisine,
          note: formData.note,
        }),
      headers: { 'Content-Type': 'application/json' },
    });

    if (res.status === 402) {
      setLoader(false);
      // ➜ open your pricing modal / route to /pricing
      // e.g. setShowPaywall(true);
      toast('Free try ended.')
      return;
    }

    if (!res.ok) {
      setLoader(false)
      console.error('Error generating PDF');
      return;
    } else {
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);

      // Create a temporary link element
      const a = document.createElement('a');
      a.href = url;
      a.download = 'meal-plan.pdf'; // Filename
      document.body.appendChild(a);
      a.click();
      a.remove();

      // Cleanup the URL object
      window.URL.revokeObjectURL(url);
      setSubmitted(true)
      setShowThanks(true)
      reset()

      setTimeout(() => {
        setShowThanks(false)
      }, 5000)
    } 
  }

  return (
    <section id='reserve' className='scroll-mt-20'>
      <div className='container'>
        <div className='relative border px-6 py-6 rounded-xl shadow-sm'>
          <form
            onSubmit={handleSubmit}
            className='flex flex-wrap w-full m-auto justify-between'>
            <h2 className='text-primary text-[20px] mb-4 font-semibold tracking-tight '>
              Tell us your preferences, we’ll handle the rest.
            </h2>
            <div className='sm:flex gap-6 w-full'>
              <div className='mx-0 my-2.5 flex-1'>
                <label htmlFor='email' className='pb-3 inline-block text-base'>
                  Email Address
                </label>
                <input
                  id='email'
                  type='email'
                  name='email'
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder='john.doe@example.com'
                  className='w-full text-base px-4 rounded-md py-2.5 border-solid border transition-all duration-500 focus:border-primary focus:outline-0'
                />
              </div>
              <div className='mx-0 my-2.5 flex-1'>
                <label htmlFor='diet' className='pb-3 inline-block text-base'>
                  Diet Preference
                </label>
                <select
                  name='diet'
                  id='diet'
                  required
                  value={formData.diet}
                  onChange={handleChange}
                  className='w-full text-base px-4 rounded-md py-2.5 border-solid border transition-all duration-500 focus:border-primary focus:outline-0'>
                  <option value=''>Choose your Preference</option>
                  <option value='Vegetarian'>Vegetarian</option>
                  <option value='Vegan'>Vegan</option>
                  <option value='Keto'>Keto</option>
                  <option value='Paleo'>Paleo</option>
                  <option value='Gluten-Free'>Gluten-Free</option>
                </select>
              </div>
            </div>
            <div className='sm:flex gap-6 w-full'>              
              
              
              <div className='mx-0 my-2.5 flex-1'>
                <label htmlFor='people' className='pb-3 inline-block text-base'>
                  No. Of People
                </label>
                <input
                  id='people'
                  type='number'
                  name='people'
                  value={formData.people}
                  onChange={handleChange}
                  placeholder='2'
                  className='w-full text-base px-4 rounded-md py-2.5 border-solid border transition-all duration-500 focus:border-primary focus:outline-0'
                />
              </div>

              <div className='mx-0 my-2.5 flex-1'>
                <label htmlFor='cuisine' className='pb-3 inline-block text-base'>
                  Preferred Cuisine
                </label>
                <input
                  id='cuisine'
                  type='text'
                  name='cuisine'
                  value={formData.cuisine}
                  onChange={handleChange}
                  placeholder='American, Italian, Mexican, Asian, Mediterranean, etc.'
                  className='w-full text-base px-4 rounded-md py-2.5 border-solid border transition-all duration-500 focus:border-primary focus:outline-0'
                />
              </div>

            </div>
            <div className='sm:flex gap-3 w-full'>
              
            </div>
            <div className='w-full mx-0 my-2.5 flex-1'>
              <label htmlFor='note' className='text-base inline-block'>
                Additional Note
              </label>
              <textarea
                id='note'
                name='note'
                value={formData.note}
                onChange={handleChange}
                className='w-full mt-2 rounded-md px-5 py-3 border-solid border transition-all duration-500 focus:border-primary focus:outline-0'
                placeholder='Anything else you wanna communicate'></textarea>
            </div>
            <div className='mx-0 my-2.5 w-full'>
              <button
                type='submit'
                disabled={!isFormValid || loader}
                className={`border leading-none px-6 text-lg font-medium py-4 rounded-full 
                    ${
                      !isFormValid || loader
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-primary border-primary text-white hover:bg-transparent hover:text-primary cursor-pointer'
                    }`}>
                Get Your Plan
              </button>
            </div>
          </form>
          {showThanks && (
            <div className='text-white bg-primary rounded-full px-4 text-lg mb-4.5 mt-3 absolute flex items-center gap-2'>
              Thanks! Your table is booked. See you soon.
              <div className='w-3 h-3 rounded-full animate-spin border-2 border-solid border-white border-t-transparent'></div>
            </div>
          )}
        </div>
        <div className='shadow-xl flex bg-white p-2 pr-3 gap-5 items-center bottom-0 right-0 z-[1] rounded-xl relative mt-10 md:mt-0 md:absolute'>
          <Image
            src={'/images/hero/pizza.webp'}
            alt='pizza-image'
            width={68}
            height={68}
          />
          <p className='text-lg font-normal text-[13px]'>
            Discover Unlimited <br /> Plans!
          </p>
        </div>
      </div>
    </section>
  )
}

export default ContactForm
