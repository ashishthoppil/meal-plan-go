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
            <h1 className='font-semibold mb-5 text-black lg:text-start text-center sm:leading-20 leading-16'>
              Plan Your Week’s Meals in 30 Seconds 🥗
            </h1>
            <p className='text-black/55 text-lg font-normal mb-10 lg:text-start text-center'>
              Get a personalized 7-day meal plan + grocery list.<br/>Save money. Save time. No more “What’s for dinner?”
            </p>
            <div className='flex flex-col sm:flex-row gap-5 items-center justify-center lg:justify-start'>
              <Link href='/#get-plan'>
                <button className='text-md font-medium rounded-lg text-white py-3 px-8 bg-primary hover:text-primary border border-primary hover:bg-transparent hover:cursor-pointer transition ease-in-out duration-300'>
                  👉 Get My Free 7-Day Plan
                </button>
              </Link>
              {/* <Link href='/#get-plan'>
                <button className='text-xl border border-primary rounded-full font-medium py-3 px-8 text-primary hover:text-white hover:bg-primary hover:cursor-pointer transition ease-in-out duration-300'>
                  Try for Free {'>'}
                </button>
              </Link> */}
            </div>
          </div>
          <div className='lg:col-span-6 flex justify-center relative pt-[5rem] md:py-4'>
            <Image src={'/images/plan_dummy.png'} height={800} width={800} alt='Plan Example' />
            {/* <ContactForm /> */}
          </div>
        </div>
      </div>
    </section>
  )
}

export default Hero
