'use client'
import Image from 'next/image'
import Masonry from 'react-masonry-css'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import GalleryImagesSkeleton from '../../Skeleton/GalleryImages'
import { Icon } from '@iconify/react'
import { GalleryImagesType } from '@/app/types/galleryimage'
import { FullMenuType } from '@/app/types/fullmenu'

const Gallery = () => {
  const [galleryImages, setGalleryImages] = useState<GalleryImagesType[]>([])
  const [fullMenu, setFullMenu] = useState<FullMenuType[]>([])
  const [loading, setLoading] = useState(true)
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const openMenu = () => setIsMenuOpen(true)
  const closeMenu = () => setIsMenuOpen(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/data')
        if (!res.ok) throw new Error('Failed to fetch')
        const data = await res.json()
        setGalleryImages(data.GalleryImagesData)
        setFullMenu(data.FullMenuData)
      } catch (error) {
        console.error('Error fetching services:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  return (
    <section id='menu' className='scroll-mt-20'>
      <div className='container'>
        <div className='text-center'>
          <p className='text-primary text-lg font-normal mb-3 tracking-widest uppercase'>
            Our Menu
          </p>
          <h2>Explore Our Signature Dishes</h2>
        </div>
        <div className='my-16 px-6'>
          <Masonry
            breakpointCols={{ default: 2, '700': 2, '500': 1 }}
            className='flex gap-6'
            columnClassName='masonry-column'>
            {/* Map through images */}
            {loading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <GalleryImagesSkeleton key={i} />
                ))
              : galleryImages.map((item, index) => (
                  <div
                    key={index}
                    className='overflow-hidden rounded-3xl mb-6 relative group'>
                    <Image
                      src={item.src}
                      alt={item.name}
                      width={600}
                      height={500}
                      className='object-cover w-full h-full'
                    />
                    <div className='w-full h-full absolute bg-black/40 top-full group-hover:top-0 duration-500 lg:p-12 md:p-8 p-3.5 flex flex-col items-start lg:gap-8 gap-4 justify-end'>
                      <p className='text-white lg:text-2xl text-xl'>
                        {item.name}
                      </p>
                      <div className='flex items-center justify-between w-full'>
                        <p className='text-white lg:text-2xl text-xl'>
                          $ {item.price}
                        </p>
                        <Link
                          href='#'
                          className='text-white rounded-full bg-primary border duration-300 border-primary py-2 lg:px-6 md:px-4 px-3 hover:bg-primary/40 hover:backdrop-blur-xs md:text-base text-sm'>
                          Learn More
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
          </Masonry>
        </div>
        <div className='flex justify-center'>
          <button
            className='px-6 py-2 border border-primary rounded-full text-base font-medium text-white bg-primary hover:bg-primary/20 hover:text-primary hover:cursor-pointer transition ease-in-out duration-300'
            onClick={openMenu}>
            View More
          </button>
          {/* menu pop-up */}
          {isMenuOpen && (
            <div
              className='fixed top-0 left-0 w-full h-full bg-black/50 flex items-center justify-center z-50 px-4'
              onClick={closeMenu}>
              <div
                className='relative mx-auto w-full max-w-2xl max-h-2/3 rounded-3xl px-4 pt-14 pb-8 text-center bg-white overflow-hidden'
                onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={closeMenu}
                  className='absolute top-0 right-0 mr-4 mt-8 hover:cursor-pointer'>
                  <Icon
                    icon='material-symbols:close-rounded'
                    width={24}
                    height={24}
                    className='text-black hover:text-primary text-24 inline-block me-2'
                  />
                </button>
                <p className='text-black text-2xl font-semibold mb-4'>
                  Full Menu
                </p>
                {/* table */}
                <div className='max-h-[350px] overflow-y-auto'>
                  <table className='w-full table-auto border-collapse text-left'>
                    <thead className='sticky top-0 bg-neutral-100 z-10'>
                      <tr>
                        <th className='py-3 px-4'>Dish</th>
                        <th className='py-3 px-4'>Description</th>
                        <th className='py-3 px-4'>Price</th>
                      </tr>
                    </thead>
                    <tbody>
                      {fullMenu.map((item, index) => (
                        <tr key={index} className='border-t'>
                          <td className='py-2 px-4'>{item.name}</td>
                          <td className='py-2 px-4'>{item.description}</td>
                          <td className='py-2 px-4'>{item.price}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

export default Gallery
