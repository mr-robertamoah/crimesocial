import { useSelector } from "react-redux";
import { AgencyType, CrimeType, FileType, PostType } from "../types";
import FilePreview from "./FilePreview";
import { getHomeReadableDate } from "../helpers";
import { useNavigate } from "react-router-dom";
import { DP } from "./DP";

export default function Post(
    { post = null, updatePost = null, deletePost = null, checkOnMap = null }: 
    { 
        post: PostType | null; 
        updatePost: ((type: 'crime' | 'agency' | 'post', item: PostType | CrimeType | AgencyType) => void) | null; 
        deletePost: ((type: 'crime' | 'agency' | 'post', item: PostType | CrimeType | AgencyType) => void) | null;
        checkOnMap: ((item: CrimeType | null) => void) | null;
        onRemove: ((file: Blob|FileType|null) => void) | null;
    }
) {
    const user = useSelector((state) => state.user)
    const navigate = useNavigate()

    function clickedUpdate() {
        if (!updatePost) return

        if (post?.crime?.length)
            return updatePost('crime', post.crime[0])

        if (post?.agency?.length)
            return navigateToAgency(post.agency[0].id)

        if (post)
            updatePost('post', post)
    }

    function navigateToAgency(agencyId: number) {
        navigate(`agency/${agencyId}`)
    }

    function clickedDelete() {
        if (!deletePost) return

        if (post?.crime?.length)
            return deletePost('crime', post.crime[0])

        if (post?.agency?.length)
            return navigateToAgency(post.agency[0].id)

        if (post)
            deletePost('post', post)
    }

    function clickedCheckOnMap() {
        if (post?.crime?.length && checkOnMap)
            checkOnMap(post.crime[0])
    }

    // function clickedRemoveFile(file: Blob|FileType|null) {
    //     if (onRemove) onRemove(file)
    // }


    if (!post) return (<></>)
    return (
        <div className="bg-blue-100 my-4 rounded-lg p-4 max-w-[500px] min-w-[300px] sm:min-w-[300px] md:min-w-[500px]">
            {(user.id == post.user?.id || user.isAdmin) && <div className="flex justify-end text-sm text-center my-2 pb-2">
                <div
                    onClick={clickedUpdate}
                    className="rounded px-2 py-1 cursor-pointer bg-green-700 text-green-300 hover:bg-green-300 transition duration-75 hover:text-green-700"
                >update</div>
                <div
                    onClick={clickedDelete}
                    className="rounded px-2 py-1 cursor-pointer ml-2 bg-red-700 text-red-300 hover:bg-red-300 transition duration-75 hover:text-red-700"
                >delete</div>
                <hr />
            </div>}
            {post.content && <div>{post.content}</div>}
            {post.crime?.length ?
                <div className="text-gray-600">
                    <div className="capitalize font-bold text-center flex justify-center items-center">
                        <div className="mr-2">{post.crime[0].name}</div>
                        <span className="text-sm p-1 text-green-300 bg-green-700 font-normal rounded lowercase">{post.crime[0].outcome}</span>
                    </div>
                    <div className="text-sm w-full overflow-hidden overflow-ellipsis my-2">{post.crime[0].description}</div>
                    <div className="my-2 text-blue-700 text-sm flex flex-col font-bold">
                        {post.crime[0].crimeTypeName ?
                            <div className="mx-auto w-fit text-center my-1">{post.crime[0].crimeTypeName}</div> :
                            <></>
                        }
                        {post.crime[0].crimeType ?
                            <div
                                title={post.crime[0].crimeType.description ?? ''}
                                className="bg-blue-300 rounded cursor-pointer py-1 px-2 mx-auto w-fit text-center my-1">{post.crime[0].crimeType.name}</div> :
                            <></>
                        }
                    </div>
                    {post.crime[0].files?.length ? 
                        <div className="flex justify-start items-center overflow-x-auto bg-white rounded p-2">
                            {post.crime[0].files?.map((file, idx) => {
                                return <FilePreview
                                    file={file}
                                    middle={true}
                                    showRemove={false}
                                    key={idx}
                                    className="mx-2 max-w-[250px] shrink-0"
                                ></FilePreview>
                                })
                            }
                        </div> :
                        <></>
                    }
                    <div className="text-sm flex justify-between items-start my-2 bg-white rounded p-2 text-gray-600">
                        <div>
                            <div>lat: {post.crime[0].lat}</div>
                            <div>lon: {post.crime[0].lon}</div>
                        </div>
                        <div>
                            {<div className="ml-2">landmark: {post.crime[0].landmark}</div>}
                            <div 
                                onClick={clickedCheckOnMap}
                                className="w-fit ml-auto mt-2 rounded px-2 py-1 cursor-pointer bg-green-700 text-green-300 hover:bg-green-300 transition duration-75 hover:text-green-700"
                            >check on map</div>
                        </div>
                    </div>
                    <div className="flex flex-col justify-between items-end text-xs text-gray-600">
                        <div className="flex justify-start items-center mt-2">
                            <div>reported by: </div>
                            <div className="ml-2">{post.user?.username}</div>
                        </div>
                        <div className="ml-2 text-end">{getHomeReadableDate(post.updatedAt)}</div>
                    </div>
                </div> :
            <></>}
            {post.agency?.length ?
                <div>
                    <div>
                        <DP size={80} alt="agency"></DP>
                        <div className="capitalize font-bold text-center flex justify-center items-center">
                            <div className="mr-2">{post.agency[0].name}</div>
                            <span className="text-sm p-1 text-green-300 bg-green-700 font-normal rounded lowercase">{post.agency[0].verifiedAt ? 'verified' : 'unverified'}</span>
                        </div>
                    </div>
                    <div className="text-sm w-full overflow-hidden overflow-ellipsis my-2">{post.agency[0].about}</div>
                    <div className="text-sm text-blue-700 flex justify-end font-bold">
                        <div className="w-fit">{`${post.agency[0].agents?.length} agent${post.agency[0].agents?.length == 1 ? '' : 's'}`}</div>
                    </div>
                    <div className="flex flex-col justify-between items-end text-xs text-gray-600">
                        <div className="flex justify-start items-center mt-2">
                            <div>added by: </div>
                            <div className="ml-2">{post.user?.username}</div>
                        </div>
                        <div className="ml-2 text-end">{getHomeReadableDate(post.updatedAt)}</div>
                    </div>
                </div> :
            <></>}
        </div>
    )
}