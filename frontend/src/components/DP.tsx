import { useEffect, useState } from "react"

export function DP(
    {username = null, size = 100, className = '', avatarUrl= ''}: 
    {username?: string|null, size: number, className?: string, avatarUrl?: string}
) {
    return (
        <div className={`${className} relative h-[${size}px] w-[${size}px] bg-blue-600 rounded-full flex justify-center items-center`}>
            <div className={`h-[${size - 10}px] w-[${size - 10}px] bg-blue-200 rounded-full flex z-[2] justify-center items-center`}>
                <div className={`bg-gray-400 h-[${size - 15}px] w-[${size - 15}px] text-sm text-center flex justify-center items-center rounded-full`}>
                    {avatarUrl ? 
                        <img alt="dp" src={`${avatarUrl}`} className="w-full h-full object-contain rounded-full"/> : 
                        'profile pic'
                    }
                </div>
            </div>
            {username && <div className="absolute top-[60%] left-[50%] p-2 bg-blue-600 z-[1] rounded-l-lg flex justify-start max-w-[200px] xs:max-w-[300px]">
                <div className="w-10 flex-shrink-0"></div>
                <div
                    className="border-blue-200 border-t-2 border-b-2 border-r-2 ml-2 p-2 text-blue-200
                        font-bold overflow-hidden text-ellipsis w-[150px]">
                    {username}
                </div>
            </div>}
        </div>
    )
}