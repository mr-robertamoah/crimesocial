import { forwardRef, useEffect, useRef } from "react"

export default forwardRef(function FormInput({ type = 'text', className = '', isFocused = false, ...props }, ref) {
    const input = ref ? ref : useRef()

    useEffect(() => {
        if (isFocused) {
            input.current.focus();
        }
    }, []);

    return (
        <input
            type={type}
            {...props}
            className={`${className} focus:outline-blue-200 py-1 px-2 placeholder-blue-400 rounded`}
        />
    )
})