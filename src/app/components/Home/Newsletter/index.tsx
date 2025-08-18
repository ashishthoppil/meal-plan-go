'use client'
import Image from 'next/image'
import { Icon } from '@iconify/react'

const Newsletter = () => {
  return (
    <section className='relative overflow-hidden md:py-20'>
      <div className='container'>
        <div className='bg-primary rounded-Newsletter grid grid-cols-1 gap-y-10 gap-x-6 md:grid-cols-12 xl:gap-x-8'>
          <div className='md:col-span-7'>
            <div className='m-5 sm:m-10 lg:ml-32 lg:mt-20 lg:mb-20'>
              <p className='text-lg font-normal text-white mb-3 tracking-widest'>
                NEWSLETTER{' '}
              </p>
              <h2 className='text-white mb-8'>
                Subscribe to<br /> our  newsletter.
              </h2>

              <div>
                <div className='relative text-white focus-within:text-white flex flex-row-reverse shadow-fi rounded-full'>
                  <input
                    type='Email address'
                    name='q'
                    className='pl-4 pr-16 py-4 text-sm w-full bg-white text-black rounded-full focus:outline-hidden focus:text-black'
                    placeholder='Enter your email'
                    autoComplete='off'
                  />
                  <div className='absolute inset-y-0 right-0 flex items-center pr-2'>
                    <button
                      type='submit'
                      className='p-1 bg-gray-900 hover:scale-110 duration-300 rounded-full hover:cursor-pointer'>
                      <Icon
                        icon='tabler:arrow-narrow-right'
                        width='28'
                        height='28'
                        className='text-white '
                      />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className='md:col-span-5 relative hidden md:block'>
            <div>
              <Image
                src={'/images/Newsletter/soup.webp'}
                alt='soup-image'
                width={626}
                height={602}
                className='-mt-24'
              />
            </div>
            <div className='absolute top-[78%]'>
              <Image
                src={'/images/Newsletter/onion.webp'}
                alt='onion-image'
                width={300}
                height={122}
              />
            </div>
            <div className='absolute top-[30%] right-[-23%]'>
              <Image
                src={'/images/Newsletter/lec.webp'}
                alt='lettuce-image'
                width={300}
                height={122}
              />
            </div>
            <div className='absolute bottom-[10%] left-[0%]'>
              <Image
                src={'/images/Newsletter/yellow.svg'}
                alt='yellow-image'
                width={59}
                height={59}
              />
            </div>
            <div className='absolute bottom-[20%] right-[20%]'>
              <Image
                src={'/images/Newsletter/blue.svg'}
                alt='blue-image'
                width={25}
                height={25}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Newsletter
