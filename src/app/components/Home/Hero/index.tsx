'use client'
import Image from 'next/image'
import Link from 'next/link'
import ContactForm from '../../Contact/Form'

const Hero = () => {
  return (
    <section id='home-section' className='bg-gray-50'>
      <div className='container xl:pt-7 pt-16'>
        <div className='grid grid-cols-1 lg:grid-cols-12 items-center'>
          <div className='lg:col-span-6'>
            <h1 className='font-bold mb-5 text-black lg:text-start text-center sm:leading-20 leading-16'>
              Your Week’s Meals, Done in 30 Seconds.
            </h1>
            <p className='text-black/55 text-lg font-normal mb-10 lg:text-start text-center'>
              Personalized 7-day meal plan and grocery list.<br/> Ready instantly, no guesswork.
            </p>
            <div className='flex flex-col sm:flex-row gap-5 items-center justify-center lg:justify-start'>
              <Link href='/#get-plan'>
                <button className='text-xl font-medium rounded-full text-white py-3 px-8 bg-primary hover:text-primary border border-primary hover:bg-transparent hover:cursor-pointer transition ease-in-out duration-300'>
                  Get My Meal Plan
                </button>
              </Link>
              <Link href='/#get-plan'>
                <button className='text-xl border border-primary rounded-full font-medium py-3 px-8 text-primary hover:text-white hover:bg-primary hover:cursor-pointer transition ease-in-out duration-300'>
                  Try for Free {'>'}
                </button>
              </Link>
            </div>
          </div>
          <div id='get-plan' className='lg:col-span-6 flex justify-center relative'>
            <ContactForm />
          </div>
        </div>
      </div>
    </section>
  )
}

export default Hero
