function Button({ children, onClick = () => null, className = "" }) {

    function clickedButton() {
        if (!onClick) return

        onClick()
    }
    return (
        <button 
            className={`${className} bg-blue-600 outline-blue-800 hover:outline outline-2 
            hover:text-white px-3 py-1 rounded transition text-blue-200 text-nowrap`} onClick={clickedButton}>
            {children}
        </button>
    )
}

export default Button