import CheckCircle from "../icons/CheckCircle";
import XCircle from "../icons/XCircle";
import { Transition } from "@headlessui/react";
import { Fragment, useState, useEffect } from "react";

export default function Alert({children, show = false, type = "success", timing = 2000, onDisappear = () => {} }) {

    const [appear, setAppear] = useState(false)

    useEffect(() => {
        if (show) setAppear(true)

        const timer = setTimeout(() => {
            setAppear(false)
            onDisappear()
        }, timing);
        
        return () => {
            clearTimeout(timer)
        }
    }, [show])

    return (
        <Transition show={appear} as={Fragment} leave="duration-200">
            <div className="z-[100] fixed w-full flex justify-center">
                <Transition.Child
                    as={Fragment}
                    enter="z-50 ease-out duration-300"
                    enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                    enterTo="opacity-100 translate-y-0 sm:scale-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                    leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                >
                    <div className={`z-50 rounded md:rounded-lg p-2 mb-2 mt-4 mx-2 sm:max-w-xl sm:mx-auto flex items-center justify-start 
                        ${type == "success" && "bg-green-300 text-green-800"}
                        ${type == "failed" && "bg-red-300 text-red-800"}
                    `}>
                        { type == "success" &&
                                (<CheckCircle className="cursor-pointer text-green-950 mr-2"></CheckCircle>)}
                        { type == "failed" &&
                                (<XCircle className="cursor-pointer text-red-950 mr-2"></XCircle>)}
                        {children}
                        
                    </div>
                </Transition.Child>
            </div>
        </Transition>
    )
}