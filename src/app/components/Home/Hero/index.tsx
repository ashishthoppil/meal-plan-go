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
              Get a personalized 7-day meal plan + grocery list.<br/>
              <span>Save <span className='font-semibold'>$100+</span> every week for just <span className='font-semibold text-[#DF6853] text-2xl'>19¢</span> per plan!</span>
            </p>
            <div className='flex flex-col sm:flex-row gap-5 items-center justify-center lg:justify-start'>
              <Link href='/#get-plan'>
                <button id='hero_button' className='text-md font-medium rounded-lg text-white py-3 px-8 bg-primary hover:text-primary border border-primary hover:bg-transparent hover:cursor-pointer transition ease-in-out duration-300'>
                  👉 Get My Free 7-Day Plan
                </button>
              </Link>
            </div>
          </div>
          <div className='lg:col-span-6 flex flex-col items-center justify-center relative pt-[5rem] md:py-4'>
            <span className='md:hidden mb-10 text-black/55 '>Here’s what you’ll get 👇</span>
            <Image src={'/images/plan_dummy.png'} height={800} width={800} alt='Plan Example' />
            {/* <ContactForm /> */}
          </div>
        </div>
      </div>
    </section>
  )
}

export default Hero
