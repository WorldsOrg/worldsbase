import React, { ReactElement } from 'react'
import Link from 'next/link'

type ItemType={
    id:number | string,
    icon:ReactElement,
    link:string,
    title:string,
    text:string
}

interface ToolBoxItemProps{
    item:ItemType,
    boxClass:string,
    paragraphClass:string
}

const ToolBoxItem = ({item,boxClass,paragraphClass}:ToolBoxItemProps) => {
  return (
    <Link key={item.id} href={item.link} className={boxClass}>
    <div className="flex items-center font-bold text-md">
      {item.icon}
      {item.title}
    </div>
    <div className={paragraphClass}>
     {item.text}
    </div>
  </Link>
  )
}

export default ToolBoxItem