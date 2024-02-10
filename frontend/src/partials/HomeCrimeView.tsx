import Button from "../components/partials/Button"

function HomeCrimeView() {
    return (
        <>
            <div className="my-3 h-[300px] w-full bg-slate-100 p-2">

            </div>
            <div className="flex justify-center">
                <div className="w-[45%]">
                    <div>
                        Want to view reported crimes in and around your current location? Lets show what we have here... just click the the show button 👇
                    </div>
                    <div>
                        <Button>show</Button>
                    </div>
                </div>
            </div>
            <div>main area</div>
        </>
    )
}

export { HomeCrimeView }