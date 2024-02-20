import { ReactElement } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { BookOpenIcon } from '@heroicons/react/24/outline'

type ItemType={
    id:number | string,
   image:string,
   name:string
}

interface ClientLibraryItemProps{
    item:ItemType,
    iconClass:string
}

const ClientLibraryItem = ({item,iconClass}:ClientLibraryItemProps) => {
  return (
    <div className="flex flex-col justify-start text-md ">
    <div className="flex items-center">
      <Image
        width="24"
        height="24"
        alt="js"
        className={iconClass}
        src={item.image}
      />
      <div className="ml-3 font-bold text-primary">{item.name}</div>
    </div>
    <Link
      href="/dashboard/docs"
      className="flex items-center justify-center w-20 p-2 mt-2 ml-12 text-sm border rounded border-primary text-primary hover:bg-gray-100 dark:hover:bg-hoverBg"
    >
      <BookOpenIcon className="w-4 h-4 mr-2" />
      docs
    </Link>
  </div>
  )
}

export default ClientLibraryItem