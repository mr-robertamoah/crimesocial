import { ReactPropTypes, forwardRef, useEffect, useRef, useState } from "react"

export default forwardRef(function ProfileSelect(
    { options = [], initialOption = '', optionClassName = '', className = '', onChange = null,  isFocused = false, ...props } : 
    { options: Array<string | { name: string; value: string }>, onChange: null | (() => string), initialOption: string; optionClassName: string; className: string; isFocused: false, props: ReactPropTypes }
, ref) {
    const select = ref ? ref : useRef()
    const [value, setValue] = useState('')


    useEffect(() => {
        if (isFocused) {
            select.current.focus();
        }
    }, []);

    function changeValue(e) {
        setValue(e.target.value)
        if (onChange) {
            onChange(e)
        }
    }

    return (
        <select
            {...props}
            onChange={(e) => changeValue(e)}
            className={`${className} ${ value == '' ? 'text-blue-400 lowercase' : 'text-gray-700 capitalize'} focus:outline-none outline-none autofill:bg-transparent focus:bg-blue-200 py-1 px-2 placeholder-blue-400 focus:bg-transparent border-b-2 border-blue-700 bg-transparent`}
        >
            {initialOption && <option value={''} className={`${optionClassName} lowercase `} disabled>{initialOption}</option>}
            {options && options.map((opt, key) => {
                if (typeof opt == 'string')
                    return <option key={key} value={opt.toUpperCase()} className={`${optionClassName} capitalize`}>{opt.toLowerCase()}</option>

                return <option key={key} value={opt.value} className={`${optionClassName} capitalize`}>{opt.name}</option>
            })}
        </select>
    )
})