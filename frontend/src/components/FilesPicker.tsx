import { useEffect, useRef, useState } from "react";
import Button from "./partials/Button";
import { useMainLayoutContext } from "../layouts/useMainLayoutContext";

export function FilesPicker(
    {
        onChange= null, onDelete = null, onRemove = null, 
        accept = 'images/*', files = null, getMedia = null,
        ...props
    } :
    {
        onChange?: ((file: File|null) => void)|null, 
        getMedia?: ((type: string) => void)|null, 
        onDelete?: ((file: File) => void)|null, onRemove?: (() => void)|null, 
        accept: string, files: Array<File> | null
    }
) {
    const fileInput = useRef()
    const { callAlert } = useMainLayoutContext()
    const [showMediaModal, setShowMediaModal] = useState(false)

    useEffect(() => {
        if (!fileInput?.current?.files && !files?.length) return
        fileInput.current.value = ''
    }, [files])

    function getFiles(e) {
        e.preventDefault()
        setShowMediaModal(true)
    }

    function getFromDevice(e) {
        e.preventDefault()
        setShowMediaModal(false)
        if (!fileInput.current) return

        fileInput.current.click()
    }
    
    function changedFiles(e) {
        if (onChange && e.target.files.length) {
            onChange(e.target.files)
        }
    }

    function deleteFile(file: File) {
        if (!onDelete) return

        onDelete(file)
    }

    function takePicture(e) {
        e.preventDefault()
        setShowMediaModal(false)
        if (!navigator?.mediaDevices?.getUserMedia)
            return callAlert({
                show: true,
                message: 'Your browser does not support taking pictures or videos',
                type: 'failed'
            })

        if (getMedia) getMedia('image')
    }

    function takeVideo(e) {
        e.preventDefault()
        setShowMediaModal(false)
        if (!navigator?.mediaDevices?.getUserMedia)
            return callAlert({
                show: true,
                message: 'Your browser does not support taking pictures or videos',
                type: 'failed'
            })

        if (getMedia) getMedia('video')
    }

    return (
        <>
            <input
                ref={fileInput}
                type="file"
                {...props}
                className="hidden"
                accept={accept}
                onInput={changedFiles}
                multiple
            />
            <div className="flex flex-col justify-start items-center">
                {(files && files.length) ?
                    <>
                        <div className="text-sm text-center lowercase text-gray-600">your attached files</div>
                        <div className="overflow-y-auto w-full py-2 bg-white flex justify-start items-center">
                            {
                                files.map((file, idx) => {
                                    const fileType = file.type.includes('image') ? 'picture' : (file.type.includes('video') ? 'video' : 'file')
                                    return file.type.includes('image') ?
                                    <div className="min-w-[150px] mx-2 p-2 rounded bg-violet-200 text-gray-600 hover:text-white hover:bg-violet-600 text-sm" key={idx}>
                                        <img src={URL.createObjectURL(file)} alt={file.name} />
                                        <div className="flex justify-end items-center my-2">
                                            <div
                                                onClick={() => deleteFile(file)}
                                                className="rounded p-2 text-sm bg-red-700 text-red-300 hover:text-white transition duration-75 cursor-pointer hover:border-red-800"
                                            >delete</div>
                                        </div>
                                    </div> :
                                    file.type.includes('video') ?
                                    <div className="min-w-[150px] mx-2 p-2 rounded bg-violet-200 text-gray-600 hover:text-white hover:bg-violet-600 text-sm" key={idx}>
                                        <video autoPlay className="w-[300px] h-[200px]" src={URL.createObjectURL(file)} width={300} height={200} onLoad={(e) => e.target.play()}>{file.name}</video>
                                        <div className="flex justify-end items-center my-2">
                                            <div
                                                onClick={() => deleteFile(file)}
                                                className="rounded p-2 text-sm bg-red-700 text-red-300 hover:text-white transition duration-75 cursor-pointer hover:border-red-800"
                                            >delete</div>
                                        </div>
                                    </div> :
                                    (<div className="min-w-[150px] mx-2 p-2 rounded bg-violet-200 text-gray-600 hover:text-white hover:bg-violet-600 text-sm" key={idx}>
                                        <div>{fileType + ` ${idx + 1}`}</div>
                                        <div>{file.name}</div>
                                        <div className="flex justify-end items-center my-2">
                                            <div
                                                onClick={() => deleteFile(file)}
                                                className="rounded p-2 text-sm bg-red-700 text-red-300 hover:text-white transition duration-75 cursor-pointer hover:border-red-800"
                                            >delete</div>
                                        </div>
                                    </div>)
                                })
                            }
                        </div>
                    </> : <></>
                }
                <div className="flex justify-center items-center mt-4 relative">
                    <Button className="mr-2 w-fit px-2" onClick={getFiles}>get files</Button>

                    <div className={`${showMediaModal ? 'visible' : 'invisible translate-y-4'} transition duration-150 rounded-lg absolute bg-white`}>
                        <div
                            onClick={() => setShowMediaModal(false)}
                            className="flex flex-col justify-center items-center p-2 relative">
                            <div className="absolute cursor-pointer -right-2 w-6 h-6 text-sm text-center rounded-full bg-gray-600 text-white p-1 justify-center items-center flex -top-2">x</div>
                            <Button className="my-3 mx-2 w-fit px-2" onClick={getFromDevice}>get from device</Button>
                            <Button className="my-3 mx-2 w-fit px-2" onClick={takePicture}>take picture</Button>
                            <Button className="my-3 mx-2 w-fit px-2" onClick={takeVideo}>take video</Button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}