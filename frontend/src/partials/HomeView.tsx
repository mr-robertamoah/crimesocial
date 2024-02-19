import { Link } from "react-router-dom";
import Button from "../components/partials/Button"
import { useSelector } from "react-redux";
import { PostType } from "../types";
import Post from "../components/Post";

function HomeView(
    { showCrimesAt = null, createCrime = null, createAgency = null } :
    { showCrimesAt?: ((where: string) => void) | null; createCrime?: (() => void) | null; createAgency?: (() => void) | null; }
) {
    const user = useSelector((state) => state.user)
    const posts = useSelector((state) => state.posts)

    function clickedShowCurrent() {
        if (!showCrimesAt) return

        showCrimesAt('current')
    }

    function clickedReport() {
        if (!createCrime) return

        createCrime()
    }

    function clickedAgency() {
        if (!createAgency) return

        createAgency()
    }

    return (
        <>
            <div className="my-3 h-[300px] w-full bg-slate-100 p-2 max-w-[500px] mx-auto" id="homemap">

            </div>
            <div className="flex justify-start p-2 items-center overflow-y-auto mx-auto max-w-[600px]">
                <div className="w-[200px] mx-4 rounded-lg bg-blue-100 p-4 text-sm flex-shrink-0">
                    {user?.id ? 
                        <>
                            <div>
                                Witnessing or witnessed a crime? Share by clicking the report button 👇
                            </div>
                            <div className="flex justify-end mt-3 mb-2 text-base">
                                <Button onClick={() => clickedReport()}>report</Button>
                            </div>
                        </> :
                        <>
                        <div>
                            Witnessing or witnessed a crime? Share by clicking the report button 👇
                        </div>
                        <div className="flex justify-end mt-3 mb-2 text-base disabled:bg-gray-700 disabled:text-gray-300 
                                        disabled:focus:border-gray-800">
                            <div className="text-sm text-gray-700 flex flex-col items-end">
                                <div className=" text-center"><Link className="hover:bg-white rounded bg-blue-200 px-2 py-1" to={'/signin'}>sign in</Link> to be able to report a crime.</div>
                                <Button 
                                    className={(!user?.id ? "bg-gray-700 text-gray-300 hover:outline-none outline-0" : '') + ' mt-2 text-base'} 
                                    onClick={() => clickedReport()}>report</Button>
                            </div>
                        </div>
                    </>
                    }
                </div>
                <div className="w-[200px] mx-4 rounded-lg bg-blue-100 p-4 text-sm flex-shrink-0">
                    <div>
                        Want to view reported crimes in and around your current location? Lets show what we have here... just click the the show button 👇
                    </div>
                    <div className="flex justify-end mt-3 mb-2 text-base">
                        <Button onClick={() => clickedShowCurrent()}>show</Button>
                    </div>
                </div>
                <div className="w-[200px] mx-4 rounded-lg bg-blue-100 p-4 text-sm flex-shrink-0 mr-6">
                    <div>
                        Want to have your Agency on this platform? It could be a Government, Profit or Non-profit agency... just click the button below 👇
                    </div>
                    <div className="flex justify-end mt-3 mb-2 text-base">
                        <Button onClick={() => clickedAgency()}>create agency</Button>
                    </div>
                </div>
            </div>
            <div>
                {posts.map((post: PostType, idx: number) => {
                    return <Post key={idx} post={post}></Post>
                })}
            </div>
        </>
    )
}

export { HomeView }