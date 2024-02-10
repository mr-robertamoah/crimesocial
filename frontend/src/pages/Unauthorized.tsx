export function Unauthorized({ children, who = 'Guest' }) {
    return (
        <div className="bg-gray-200 h-[25vh]">
            <div className="my-10 mb-4 flex justify-center w-full p-2">
                <div className="w-fit text-2xl font-bold bg-gradient-to-r from-blue-800 to-blue-400 text-transparent bg-clip-text">Hi {who}</div>
            </div>
            {children}
        </div>
    )
}