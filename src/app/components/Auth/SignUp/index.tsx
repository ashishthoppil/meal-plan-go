'use client'
import Link from 'next/link'
import SocialSignUp from '../SocialSignUp'
import Logo from '@/app/components/Layout/Header/Logo'
import { useState } from 'react'
import { supabase } from '@/utils/supabase/client'
import { toast } from 'react-toastify';

const SignUp = ({ setIsSignUpOpen, setIsSignInOpen, setIsPlanOpen }: any) => {  

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function onRegister(e: React.FormEvent) {
    e.preventDefault();
    setErr(null); setMsg(null); setLoading(true);

    const { error } = await supabase().auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name, email },
      },
    });


    setLoading(false);
    if (error) {
      setErr(error.message);
    } else {
      setIsSignUpOpen(false);
      
      const { data: { user } } = await supabase().auth.signInWithPassword({ email, password })
      setIsPlanOpen(true)
      toast('Successfully Registered!', {
        progressClassName: 'bg-orange-500'
      })
    }
  }

  return (
    <>
      <div className='mb-10 text-center mx-auto inline-block'>
        <Logo />
      </div>

      {/* <SocialSignUp />

      <span className="z-1 relative my-8 block text-center before:content-[''] before:absolute before:h-px before:w-[40%] before:bg-black/20 before:bg-opacity-60 before:left-0 before:top-3 after:content-[''] after:absolute after:h-px after:w-[40%] after:bg-black/20 after:bg-opacity-60 after:top-3 after:right-0">
        <span className='text-body-secondary relative z-10 inline-block px-3 text-base text-black'>
          OR
        </span>
      </span> */}

      <form onSubmit={onRegister}>
        <div className='mb-[22px]'>
          <input
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            type='text'
            placeholder='Name'
            name='name'
            required
            className='w-full rounded-md border border-solid bg-transparent px-5 py-3 text-base text-dark outline-hidden transition border-gray-200 placeholder:text-black/30 focus:border-primary focus-visible:shadow-none text-black'
          />
        </div>
        <div className='mb-[22px]'>
          <input
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            type='email'
            placeholder='Email'
            name='email'
            required
            className='w-full rounded-md border border-solid bg-transparent px-5 py-3 text-base text-dark outline-hidden transition border-gray-200 placeholder:text-black/30 focus:border-primary focus-visible:shadow-none text-black'
          />
        </div>
        <div className='mb-[22px]'>
          <input
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            type='password'
            placeholder='Password'
            name='password'
            required
            className='w-full rounded-md border border-solid bg-transparent px-5 py-3 text-base text-dark outline-hidden transition border-gray-200 placeholder:text-black/30 focus:border-primary focus-visible:shadow-none text-black'
          />
        </div>
        <div className='mb-9'>
          <button
            disabled={loading}
            type='submit'
            className='flex w-full items-center text-18 font-medium text-white justify-center rounded-md bg-primary px-5 py-3 text-darkmode transition duration-300 ease-in-out hover:bg-transparent hover:text-primary border-primary border'>
            {loading ? 'Creating Account' : 'Sign Up'} 
          </button>
          <span className='text-red-500'>{err}</span>

        </div>
      </form>

      <p className='text-body-secondary mb-4 text-black/60 text-base'>
        By creating an account you are agree with our{' '}
        <a href='/' className='text-primary hover:underline'>
          Privacy
        </a>{' '}
        and{' '}
        <a href='/' className='text-primary hover:underline'>
          Policy
        </a>
      </p>

      <p className='text-body-secondary text-black/60 text-base'>
        Already have an account?
        <Link onClick={(e) => {
          e.preventDefault();
          setIsSignUpOpen(false);
          setIsSignInOpen(true)
        }} href='/' className='pl-2 text-primary hover:underline'>
          Sign In
        </Link>
      </p>
    </>
  )
}

export default SignUp
