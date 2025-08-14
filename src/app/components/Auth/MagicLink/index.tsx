'use client'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { validateEmail } from '../../../../utils/validateEmail'
import Loader from '@/app/components/Common/Loader'

const MagicLink = () => {
  const [email, setEmail] = useState('')
  const [loader, setLoader] = useState(false)

  const handleSubmit = (e: any) => {
    e.preventDefault()

    if (!email) {
      return toast.error('Please enter your email address.')
    }

    setLoader(true)
    if (!validateEmail(email)) {
      setLoader(false)
      return toast.error('Please enter a valid email address.')
    } else {
      console.log(123)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className='mb-[22px]'>
        <input
          type='email'
          placeholder='Email'
          name='email'
          required
          value={email}
          onChange={(e) => setEmail(e.target.value.toLowerCase())}
          className='w-full rounded-md border border-stroke bg-transparent px-5 py-3 text-base text-dark outline-hidden transition placeholder:text-dark-6 focus:border-primary focus-visible:shadow-none dark:border-dark-3 dark:text-white dark:focus:border-primary'
        />
      </div>
      <div className='mb-9'>
        <button
          type='submit'
          className='flex w-full cursor-pointer items-center justify-center rounded-md border border-primary bg-[#102C46] px-5 py-3 text-base text-white transition duration-300 ease-in-out hover:bg-[#102C46]'>
          Send Magic Link
        </button>
      </div>
    </form>
  )
}

export default MagicLink
