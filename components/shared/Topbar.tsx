import { OrganizationSwitcher, SignedIn, SignOutButton } from '@clerk/nextjs'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'
import {dark} from '@clerk/themes'

function Topbar() {
  return <>
    <nav className='topbar'>
      <Link href='/' className='flex item-center gap-4'>
        <Image src="/assets/logo.svg" alt='logo' width={20} height={20} />
        <p className='text-heading3-bold text-light-1 max-xs:hidden'>Thread</p>
      </Link>
      <div className='felx item-center gap-1'>
        <div className='block md:hidden'>
          <SignedIn>
            <SignOutButton>
              <Image src="/assets/logout.svg"
                alt='logout'
                width={24}
                height={24}
              />
            </SignOutButton>
          </SignedIn>
        </div>
        <OrganizationSwitcher
          appearance={{
            baseTheme:dark,
            elements: {
              organizationSwitcherTrigger:
                "py-2 px-4"
            }
          }}
        />
      </div>
    </nav>
  </>
}

export default Topbar
