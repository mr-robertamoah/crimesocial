import { useEffect, useRef, useState } from "react";
import { DP } from "./DP";
import Button from "./partials/Button";

export function ImageChange(
    {onChange= null, avatar= {url: '', name: ''}, onDelete = null, onRestore = null, onRemove = null, hasInitialAvatar = false, ...props}:
    {onChange?: ((file: File|null) => void)|null, avatar?: {url: string, name: string}, onDelete?: (() => void)|null,
        onRestore?: (() => void)|null, onRemove?: (() => void)|null, hasInitialAvatar: boolean
    }
) {
    const fileInput = useRef()
    const [deleted, setDeleted] = useState(false)
    const [added, setAdded] = useState(false)

    useEffect(() => {
        if (avatar.url && !avatar.name) {
            setAdded(false)
            setDeleted(false)
        }
        if (avatar.url && avatar.name) {
            setAdded(true)
        }
    }, [avatar])

    function getImage(e) {
        e.preventDefault()
        if (!fileInput.current) return

        fileInput.current.click()
    }

    function deleteImage(e) {
        e.preventDefault()
        setDeleted(true)
        if (!onDelete) return

        onDelete()
    }

    function restoreImage(e) {
        e.preventDefault()
        setDeleted(false)
        if (!onRestore) return

        onRestore()
    }

    function removeImage(e) {
        e.preventDefault()
        setAdded(false)
        if (onChange) onChange(null)

        if (!onRemove) return

        onRemove()
    }

    function changedImage(e) {
        if (onChange && e.target.files.length) {
            onChange(e.target.files[0])
            setAdded(true)
        }
    }

    return (
        <>
            <input ref={fileInput} type="file" {...props} className="hidden" accept="image/*" onInput={changedImage}/>
            <div className="flex justify-start items-center">
                <DP size={70} className="mr-2" avatarUrl={avatar.url}/>
                <div>
                    {avatar.name && <div className="mb-2 text-sm text-gray-700">{avatar.name}</div>}
                    <div className="flex items-center">
                        {added && <Button onClick={removeImage} className="bg-red-400 text-red-800">remove {avatar.name}</Button>}
                        {!added && <Button className="mr-2" onClick={getImage}>get image</Button>}
                        {(onDelete && hasInitialAvatar && !added && !deleted) && <Button className="mr-2" onClick={deleteImage}>delete avatar</Button>}
                        {(deleted && onRestore && hasInitialAvatar && !added) && <Button className="mr-2" onClick={restoreImage}>restore avatar</Button>}
                    </div>
                </div>
            </div>
        </>
    )
}