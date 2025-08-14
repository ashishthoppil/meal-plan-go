'use client'

import React, { FC, useEffect, useState } from 'react'
import Link from 'next/link'
import { Icon } from '@iconify/react'
import Logo from '../Header/Logo'
import { FooterLinkType } from '@/app/types/footerlink'

const Footer: FC = () => {
  const [footerlink, SetFooterlink] = useState<FooterLinkType[]>([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/data')
        if (!res.ok) throw new Error('Failed to fetch')
        const data = await res.json()
        SetFooterlink(data.FooterLinkData)
      } catch (error) {
        console.error('Error fetching services:', error)
      }
    }
    fetchData()
  }, [])

  return (
    <footer className='pt-8 border-t-1'>
      <div className='container'>
        <div className='flex justify-center grid-cols-1 sm:grid-cols-6 lg:gap-20 md:gap-24 sm:gap-12 gap-12 pb-10'>
          <div className='flex flex-col items-center justify-center col-span-2'>
            <Logo />
            <p className='text-center text-sm font-medium text-grey my-5 max-w-70%'>
              Plan in minutes, eat well all week long.
            </p>
            <div className='flex gap-6 items-center'>
              <Link
                href='#'
                className='group bg-white hover:bg-primary rounded-full shadow-xl p-3'>
                <Icon
                  icon='fa6-brands:facebook-f'
                  width='16'
                  height='16'
                  className=' group-hover:text-white text-black'
                />
              </Link>
              <Link
                href='#'
                className='group bg-white hover:bg-primary rounded-full shadow-xl p-3'>
                <Icon
                  icon='fa6-brands:instagram'
                  width='16'
                  height='16'
                  className=' group-hover:text-white text-black'
                />
              </Link>
              <Link
                href='#'
                className='group bg-white hover:bg-primary rounded-full shadow-xl p-3'>
                <Icon
                  icon='fa6-brands:x-twitter'
                  width='16'
                  height='16'
                  className=' group-hover:text-white text-black'
                />
              </Link>
            </div>
          </div>
        </div>
        <div className='border-t border-grey/15 py-5 flex flex-col sm:flex-row justify-between sm:items-center gap-5'>
          <p className='text-center md:text-left text-sm text-black/70'>
            @2025 - MealPlanGo. All Rights Reserved.
          </p>

          <p className='text-center md:text-left text-sm text-black/70'>
            Made with Love ❤️
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
