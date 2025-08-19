'use client'
import Image from 'next/image'
import React, { useRef } from 'react'
import { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import Signin from '../../Auth/SignIn'
import { Icon } from '@iconify/react/dist/iconify.js'
import { checkAuth, supabase } from '@/utils/supabase/client'
import SignUp from '../../Auth/SignUp'
import Link from 'next/link'

const ContactForm = () => {
  const [formData, setFormData] = useState({
    diet: '',
    people: '1',
    cuisine: '',
    note: '',
  })
  const [loader, setLoader] = useState(false)
  const [isFormValid, setIsFormValid] = useState(false)
  const [isSignInOpen, setIsSignInOpen] = useState(false)
  const [isSignUpOpen, setIsSignUpOpen] = useState(false)
  const [user, setUser] = useState<any>();
  const [isPlanOpen, setIsPlanOpen] = useState<any>(false);
  const [downloadReady, setDownloadReady] = useState<any>(false);

  const formRef = useRef<any>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const userInfo = await checkAuth();
      setUser(userInfo);
      const heroBtn = document.getElementById('hero_button')
      if (userInfo && heroBtn) {
        heroBtn.innerHTML = '👉 Get My 7-Day Plan'
      }
    };
    fetchUser();
  }, [isSignInOpen, isSignUpOpen]);

  useEffect(() => {
    if (formData.diet !== '') {
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
    formData.diet = ''
    formData.people = ''
    formData.cuisine = ''
    formData.note = ''
  }
  const handleSubmit = async (e: any) => {
    e.preventDefault()
    setLoader(true)
    formRef.current?.scrollIntoView({
      behavior: "smooth",
    });
    const { data: { user } } = await supabase().auth.getUser();
    

    const res = await fetch('/api/generate-plan', {
      method: 'POST',
      body: JSON.stringify({
        email: localStorage.getItem('mpg_email'),
        dietPreference: formData.diet,
        peopleCount: formData.people,
        cuisine: formData.cuisine,
        additionalNote: formData.note,
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
      setDownloadReady(true);
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);

      // Create a temporary link element
      const a = document.getElementById('download-link') as HTMLAnchorElement | null;
      if (a) {
        a.href = url;
        a.download = `${formData.diet}-Meal-Plan-${formData.people}-People.pdf`; // Filename
        toast('Meal Plan Created!')
        setLoader(false)
        reset()
      }
    } 
  }

  return (

    <section id='home-section' className='bg-gray-50'>
      <div className='container xl:pt-7 pt-0 md:pt-16'>
        <div className='grid grid-cols-1 lg:grid-cols-12 items-center'>
          <div className='lg:col-span-6 flex justify-center relative md:py-0'>
            <section id='reserve' className='scroll-mt-20'>
              <div className='container'>
                
                <div ref={formRef} id='get-plan'   className='flex items-center justify-center relative border px-6 py-6 rounded-xl shadow-sm '>
                  {!loader ? <form
                    onSubmit={handleSubmit}
                    className='flex flex-wrap w-full m-auto justify-between '>
                    <h2 className='text-primary text-[16px] leading-7 md:text-[20px] mb-4 font-semibold tracking-tight '>
                      Tell us your preferences, we’ll handle the rest ✅
                    </h2>
                    
                    <div className='sm:flex gap-6 w-full'>
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
                          <option value='No Preference'>Standard (Includes Meat & Veg)</option>
                          <option value='Vegetarian'>Vegetarian</option>
                          <option value='Vegan'>Vegan</option>
                          <option value='Keto'>Keto</option>
                          <option value='Paleo'>Paleo</option>
                          <option value='Gluten-Free'>Gluten-Free</option>
                          <option value='Dairy-Free'>Dairy-Free</option>
                          <option value='Diabetic-Friendly'>Diabetic-Friendly</option>
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

                      {user && <div className='mx-0 my-2.5 flex-1'>
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
                      </div>}

                    </div>

                    {user && <div className='w-full mx-0 my-2.5 flex-1'>
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
                    </div>}
                    <div className='mx-0 my-2.5 w-full'>
                      <button
                        type='submit'
                        disabled={!isFormValid || loader}
                        className={`border leading-none px-6 text-md font-medium py-4 rounded-lg w-full md:w-auto
                            ${
                              !isFormValid || loader
                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                : 'bg-primary border-primary text-white hover:bg-transparent hover:text-primary cursor-pointer'
                            }`}>
                        {loader ? 'Creating Your Plan...' : '📋 Get Your Plan'}
                      </button>
                    </div>
                    {!user && <span className='text-center md:text-left text-[12px] text-gray-400'>✨ More personalization options available after sign up — allergies, favorites, cuisines included.</span>}

                  </form> :
                  <div className='flex flex-col gap-10 items-center justify-center'>
                    <Image alt='Preparing Meal Plans' src={'/images/preparing.gif'} width={150} height={150} />
                    <span className='text-center'>Preparing your plan, should be ready in under a minute! ❤️</span>
                  </div>
                  }
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
                      width={16}
                      height={16}
                      className='text-black hover:text-primary text-24 inline-block me-2'
                    />
                  </button>
                  <div className='flex flex-col gap-5 mt-5 text-[14px]'>
                    <span>Get <span className='font-semibold text-orange-500 text-[22px]'>25</span> Meal Plans + Grocery Lists for just <span className='font-semibold text-orange-500 text-[22px]'>19¢</span> per plan.</span>
                    <div className='mt-5'>
                      <h1 className='font-semibold text-[18px]'>Here’s what you’ll get 👇</h1>
                      <ul className='text-center my-10'>
                        <li>✅ 25 Weekly Meal Plans 🥗</li>
                        <li>✅ Grocery List Tailored to the Meal Plans 📋</li>
                        <li>✅ Personalize Meal Plans with Allergies & Favorites ✨</li>
                      </ul>
                    </div>
                    <Link
                      className='bg-primary text-white px-4 py-2 rounded-lg border border-primary hover:text-primary hover:bg-transparent hover:cursor-pointer transition duration-300 ease-in-out font-semibold'
                      onClick={() => {
                        setIsPlanOpen(false)
                      }}
                      href={`https://kulfi.lemonsqueezy.com/buy/5fcaa060-e3d5-46cb-8b62-14759a5818e3?checkout[custom][user_id]=${user.id}`}
                      target='_blank'
                    >
                      Buy MealPlanGo - Monthly Subscription
                    </Link>
                  </div>
                  
                </div>
              </div>
            )}

            {downloadReady && (
              <div className='fixed top-0 left-0 w-full h-full bg-black/50 flex items-center justify-center z-50'>
                <div
                  className='relative mx-auto w-full max-w-md overflow-hidden rounded-lg bg-dark_grey/90 bg-white backdrop-blur-md px-8 pt-14 pb-8 text-center'>
                  <button
                    onClick={() => setDownloadReady(false)}
                    className='absolute top-0 right-0 mr-4 mt-8 hover:cursor-pointer'
                    aria-label='Close Sign Up Modal'>
                    <Icon
                      icon='material-symbols:close-rounded'
                      width={16}
                      height={16}
                      className='text-black hover:text-primary text-24 inline-block me-2'
                    />
                  </button>
                  <div className='flex flex-col gap-5 mt-5 text-[14px]'>
                    <span className='text-[22px]'>Your Meal Plan is <span className='font-semibold text-orange-500'>Ready!</span></span>
                    <div className='mt-5'>
                      <h1 className='font-semibold text-[18px]'>Here’s what you chose 👇</h1>
                      <ul className='text-center my-10'>
                        <li>Diet Preference: {formData.diet}</li>
                        <li>People Count: {formData.people}</li>
                        {formData.cuisine ? <li>Cuisine: {formData.cuisine}</li> : <></>}
                        {formData.note ? <li>Additional Info: {formData.note}</li> : <></>}
                      </ul>
                    </div>
                    <a
                      id='download-link'
                      className='bg-primary text-white px-4 py-2 rounded-lg border border-primary hover:text-primary hover:bg-transparent hover:cursor-pointer transition duration-300 ease-in-out font-semibold'
                    >
                      📃 Download Meal Plan
                    </a>
                    
                  </div>
                  
                </div>
              </div>
            )}
    </section>
          </div>
          <div className='lg:col-span-6 pl-0 md:pl-10'>
            <h1 className='text-[2rem] md:text-[3rem] font-semibold mb-5 text-black lg:text-start text-center sm:leading-14 leading-10'>
              Already helping 30+ people save hours and money every week ❤️
            </h1>
            {/* <p className='text-black/55 text-lg font-normal mb-10 lg:text-start text-center'>
              Save money and time, cut food waste, and never stress about meals again.
            </p> */}
            <div className='flex flex-col gap-5'>
              <h1 className='font-semibold text-[18px] text-center md:text-left'>Here’s what you’ll get 👇</h1>
              <ul className='text-center md:text-left'>
                <li>✅ 25 7-Day Meal Plans 🥗</li>
                <li>✅ Grocery List Tailored to the Plans 📋</li>
                <li>✅ Personalize Meal Plans with Allergies & Favorites ✨</li>
              </ul>
            </div>
            <div className='mt-5 flex flex-col sm:flex-row gap-5 items-center justify-center lg:justify-start'>
                <button onClick={() => {
                  if (user) {
                    const recipient = "support@kulfi-ai.com";
                    const subject = "Feedback for MealPlanGo";
                    const body = "Enter your suggestion here";
                    const mailtoLink = `mailto:${recipient}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
                    window.location.href = mailtoLink;
                  } else {
                    setIsSignUpOpen(true)
                  }
                }} className='text-md font-medium rounded-lg text-white py-3 px-8 bg-primary hover:text-primary border border-primary hover:bg-transparent hover:cursor-pointer transition ease-in-out duration-300'>
                  {user ? 'Got Feedback or Suggestions?' : '🔓 Unlock your full 7-day plan'}
                </button>
            </div>
          </div>
        </div>
      </div>
    </section>


    
  )
}

export default ContactForm
