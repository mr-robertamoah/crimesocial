import { ReactNode } from "react";

export default function Loader({ switchAppearance = false, children }: {switchAppearance: boolean, children: ReactNode}) {
    return (
        <div className={`${switchAppearance ? 'opacity-100 translate-y-0' : '-translate-y-8 hidden'} z-10 w-full xs:w-[80%] mx-auto transition-all opacity-100`}>
            <div className={`${!switchAppearance ? 'opacity-0 ' : ''} p-2 bg-blue-300 text-blue-700 text-sm text-center rounded`}>
                {children}
            </div>
        </div>
    )
}