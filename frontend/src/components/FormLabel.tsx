export function FormLabel({ children, className = '', htmlFor = '' }) {

    return (
        <label className={`${className} text-blue-700 text-lg`} htmlFor={htmlFor}>
            {children}
        </label>
    )
}