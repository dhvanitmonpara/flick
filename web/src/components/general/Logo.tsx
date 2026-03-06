import Link from 'next/link'
import React from 'react'

function Logo() {
  return (
    <Link href="/" className='mb-3 w-full'>
      <h1 className="font-avallon p-4 pt-6 pb-8 text-3xl sm:text-4xl w-fit text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors text-center select-none">Flick</h1>
    </Link>
  )
}

export default Logo