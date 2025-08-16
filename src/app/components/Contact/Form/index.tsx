'use client'
import Image from 'next/image'
import React from 'react'
import { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import Signin from '../../Auth/SignIn'
import { Icon } from '@iconify/react/dist/iconify.js'
import { checkAuth, supabase } from '@/utils/supabase/client'
import SignUp from '../../Auth/SignUp'
import Link from 'next/link'

const ContactForm = () => {
  const [formData, setFormData] = useState({
    email: '',
    diet: '',
    people: '1',
    cuisine: '',
    note: '',
  })
  const [showThanks, setShowThanks] = useState(false)
  const [loader, setLoader] = useState(false)
  const [isFormValid, setIsFormValid] = useState(false)
  const [isSignInOpen, setIsSignInOpen] = useState(false)
  const [isSignUpOpen, setIsSignUpOpen] = useState(false)
  const [user, setUser] = useState<any>();
  const [isPlanOpen, setIsPlanOpen] = useState<any>(false);

  useEffect(() => {
    const fetchUser = async () => {
      const userInfo = await checkAuth();
      setUser(userInfo);
    };
    fetchUser();
  }, [isSignInOpen, isSignUpOpen]);

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

    const { data: { user } } = await supabase().auth.getUser();
    

    const res = await fetch('/api/generate-plan', {
      method: 'POST',
      body: JSON.stringify({
          email: formData.email,
          diet: formData.diet,
          people: formData.people,
          cuisine: formData.cuisine,
          note: formData.note,
          user
        }),
      headers: { 'Content-Type': 'application/json' },
    });

    if (res.status === 402) {
      const data = await res.json()
      if(data.error === 'choose_plan') {
        setIsPlanOpen(true);
        setLoader(false)
        return;
      } else if (data.error === 'limit_reached') {
        toast('You have used up all your credits!')
        setLoader(false)
        return;
      } else if (data.error === 'trial_exhausted') {
        setLoader(false)
        setIsSignInOpen(true);
        return;
      }
      setIsSignInOpen(true);
      return;
    }

    if (!res.ok) {
      console.error('Error generating PDF');
      setLoader(false)
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
      toast('Meal Plan Created!')
      setLoader(false)
      reset()
    } 
  }

  return (
    <section id='reserve' className='scroll-mt-20'>
      <div className='container'>
        <div className='flex items-center justify-center relative border px-6 py-6 rounded-xl shadow-sm min-w-full min-h-full h-full  md:min-w-[35rem] md:min-h-[35rem] md:h-[35rem]'>
          {!loader ? <form
            onSubmit={handleSubmit}
            className='flex flex-wrap w-full m-auto justify-between '>
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
                  <option value='No Preference'>No Preference</option>
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
                placeholder='Anything else you want to communicate like allergies or other preferences'></textarea>
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
                {loader ? 'Creating Your Plan...' : 'Get Your Plan'}
              </button>
            </div>
          </form> :
          <div className='flex flex-col gap-10 items-center justify-center'>
            <Image alt='Preparing Meal Plans' src={'/images/preparing.gif'} width={150} height={150} />
            <span className='text-center'>Preparing your plan, should be ready in under a minute! ❤️</span>
          </div>
          }
        </div>
        <div className='shadow-xl flex bg-white p-2 pr-3 gap-5 items-center bottom-0 right-0 z-[1] rounded-xl relative mt-10 md:mt-0 md:absolute'>
          <Image
            src={'/images/hero/pizza.webp'}
            alt='pizza-image'
            width={68}
            height={68}
          />
          <p className='text-lg font-normal text-[13px]'>
            Plan your meals <br /> with MealPlanGo!
          </p>
        </div>
      </div>


      {isSignInOpen && (
              <div className='fixed top-0 left-0 w-full h-full bg-black/50 flex items-center justify-center z-50'>
                <div
                  className='relative mx-auto w-full max-w-md overflow-hidden rounded-lg px-8 pt-14 pb-8 text-center bg-white'>
                  <button
                    onClick={() => setIsSignInOpen(false)}
                    className='absolute top-0 right-0 mr-4 mt-8 hover:cursor-pointer'
                    aria-label='Close Sign In Modal'>
                    <Icon
                      icon='material-symbols:close-rounded'
                      width={24}
                      height={24}
                      className='text-black hover:text-primary text-24 inline-block me-2'
                    />
                  </button>
                  <Signin setIsSignInOpen={setIsSignInOpen} setIsSignUpOpen={setIsSignUpOpen} setIsPlanOpen={setIsPlanOpen} />
                </div>
              </div>
            )}
            {isSignUpOpen && (
              <div className='fixed top-0 left-0 w-full h-full bg-black/50 flex items-center justify-center z-50'>
                <div
                  className='relative mx-auto w-full max-w-md overflow-hidden rounded-lg bg-dark_grey/90 bg-white backdrop-blur-md px-8 pt-14 pb-8 text-center'>
                  <button
                    onClick={() => setIsSignUpOpen(false)}
                    className='absolute top-0 right-0 mr-4 mt-8 hover:cursor-pointer'
                    aria-label='Close Sign Up Modal'>
                    <Icon
                      icon='material-symbols:close-rounded'
                      width={24}
                      height={24}
                      className='text-black hover:text-primary text-24 inline-block me-2'
                    />
                  </button>
                  <SignUp setIsSignUpOpen={setIsSignUpOpen} setIsSignInOpen={setIsSignInOpen} setIsPlanOpen={setIsPlanOpen} />
                </div>
              </div>
            )}
            {isPlanOpen && (
              <div className='fixed top-0 left-0 w-full h-full bg-black/50 flex items-center justify-center z-50'>
                <div
                  className='relative mx-auto w-full max-w-md overflow-hidden rounded-lg bg-dark_grey/90 bg-white backdrop-blur-md px-8 pt-14 pb-8 text-center'>
                  <button
                    onClick={() => setIsPlanOpen(false)}
                    className='absolute top-0 right-0 mr-4 mt-8 hover:cursor-pointer'
                    aria-label='Close Sign Up Modal'>
                    <Icon
                      icon='material-symbols:close-rounded'
                      width={24}
                      height={24}
                      className='text-black hover:text-primary text-24 inline-block me-2'
                    />
                  </button>
                  <div className='flex flex-col gap-5 mt-5'>
                    <span>Get <span className='font-semibold text-orange-500'>20</span> Meal Plans + Grocery Lists for just $4.99 per month!</span>
                    <Link
                      className='bg-primary text-white px-4 py-2 rounded-lg border  border-primary hover:text-primary hover:bg-transparent hover:cursor-pointer transition duration-300 ease-in-out'
                      onClick={() => {
                        setIsPlanOpen(false)
                      }}
                      // href='https://kulfi.lemonsqueezy.com/buy/16d53874-c04f-47bf-8a7b-0eaf88691ef0'
                      href={`https://kulfi.lemonsqueezy.com/buy/5fcaa060-e3d5-46cb-8b62-14759a5818e3?checkout[custom][user_id]=${user.id}`}
                      target='_blank'
                    >
                      Buy MealPlanGo - Monthly Subscription
                    </Link>
                  </div>
                  
                </div>
              </div>
            )}
    </section>
  )
}

export default ContactForm
