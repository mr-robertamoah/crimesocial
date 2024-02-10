function Button(
    { children, onClick = (e) => null, className = "" } :
    {className?: string, onClick?: ((e) => null)|((e) => void)|null, children: ReactNode}
) {

    function clickedButton(e) {
        if (!onClick) return

        onClick(e)
    }
    return (
        <button 
            className={`${className} bg-blue-600 outline-blue-800 hover:outline outline-2 
            hover:text-white px-3 py-1 rounded transition duration-75 text-blue-200 text-nowrap`} onClick={clickedButton}>
            {children}
        </button>
    )
}

export default Button