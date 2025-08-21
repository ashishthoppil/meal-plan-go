'use client'
import React, { useRef } from 'react'



export default function Home() {

const audioRef = useRef<HTMLAudioElement | null>(null);

const whistleHandler = () => {
    if (audioRef.current) {
      audioRef.current.play();
    }
}

  return (
    <div className='flex items-center justify-center h-screen'>
        <button onClick={whistleHandler} className='lg:block  duration-300 bg-primary/15 text-primary hover:text-white hover:bg-primary font-medium text-md py-2 px-6 rounded-lg hover:cursor-pointer'>
            🔊 Play
        </button>
        <audio ref={audioRef} src="/whistle.mp3" />
    </div>
  )
}
