export const ColorConfiguration = () => {
  return (
    <>
      <h3 className=' text-xl font-semibold mt-8 text-black'>Colors</h3>
      <div className='p-6 rounded-md border mt-4 '>
        <p className='text-base font-medium text-black/60'>
          <span className='font-semibold text-lg text-black'>
            1. Override Colors
          </span>{' '}
          <br />
          For any change in colors : tailwind.config.ts
        </p>
        <div className='py-4 px-5 rounded-md bg-dark_grey mt-8'>
          <p className='text-sm text-black/60 flex flex-col gap-2'>
            <span>primary: "#df6853",</span>
            <span>grey: "#363636",</span>
          </p>
        </div>
      </div>
      <div className='p-6 rounded-md border mt-4 '>
        <p className='text-base font-medium text-black/60'>
          <span className='font-semibold text-lg text-black'>
            2. Override Theme Colors
          </span>{' '}
          <br />
          For change , go to : tailwind.config.ts
        </p>
        <div className='py-4 px-5 rounded-md bg-dark_grey mt-8'>
          <p className='text-sm text-black/60 flex flex-col gap-2'>
            <span>primary: "#df6853",</span>
          </p>
        </div>
      </div>
    </>
  )
}
