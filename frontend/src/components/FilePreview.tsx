import { useEffect, useRef, useState } from "react"

export default function FilePreview(
    { 
        hasCircleImg = false, show = false, middle = false, file = null, showRemove = true, imgSrc = '',
        width = '75%', type = 'normal', removeFile = null,
    }:
    { 
        hasCircleImg: boolean; show: boolean; middle: boolean; file: Blob | null; showRemove: boolean; imgSrc: string;
        width: string; type: string; removeFile: (() => void) | null;
    }
) {
    const circlepreviewimg = useRef(null)
    const circlepreview = useRef(null)
    const preview = useRef(null)
    const [message, setMessage] = useState('')

    useEffect(() => {
        if (hasCircleImg) {
            if (circlepreview.current) {
                circlepreview.current.style.display = 'none'
            }
            
            if (circlepreviewimg.current) {
                circlepreviewimg.current.style.display = 'block'
            }
        } else {
            if (circlepreview.current) {
                circlepreview.current.style.display = 'block'
            }
            
            if (circlepreviewimg.current) {
                circlepreviewimg.current.style.display = 'none'
            }
        }
    }, [hasCircleImg])

    useEffect(() => {
        if (!file) {
            return
        }

        if (file.url) {
            showFile(file)
            return
        }

        readFile(file)
    }, [file])

    function clickedRemove() {
        preview.current.innerHTML = ''

        if (removeFile) removeFile()
    }

    function showFile(f) {
        if (preview.current) {
            preview.current.innerHTML = ''
        }

        let el = null
        if (f.type.includes('image')) {
            el = document.getElementById('img')
            if (!el)
                el = document.createElement('img')
            el = setImageAttributes(el)
            el.src = f.url
        } else if (f.type.includes('video')) {
            el = document.getElementById('video')
            if (!el)
                el = document.createElement('video')
            el = setVideoAttributes(el)
            el.src = f.url
        } else if (f.type.includes('audio')) {
            el = document.getElementById('audio')
            if (!el)
                el = document.createElement('audio')
            el = setAudioAttributes(el)
            el.src = f.url
        } else if (f.type.includes('file')) {
            el = document.createElement('div')
            el = setFileAttributes(el, f)
        } else {
            setMessage(`${f.name} is not a valid file`)
        }

        if (!el) {
            return
        }
        appendElementToPreview(el)
    }

    function appendElementToPreview(element) {
        if (!preview.current) {
            setTimeout(() => {
                appendElementToPreview(element)
            }, 100);
            return
        }
        preview.current.appendChild(element)
    }

    function setImageAttributes(el) {
        el.setAttribute('id','img')
        el.style.width = '100%'
        el.style.height = '100%'
        el.style.objectFit = 'contain'
        el.style.objectPosition = 'center'
        return el
    }

    function setVideoAttributes(el) {
        el.setAttribute('id','video')
        el.setAttribute('controls','true')
        el.setAttribute('controlslist','nodownload')
        el.style.width = '100%'
        el.style.height = '100%'
        el.style.objectFit = 'contain'
        el.style.objectPosition = 'center'
        return el
    }

    function setAudioAttributes(el) {
        el.setAttribute('id','audio')
        el.setAttribute('controls','true')
        el.setAttribute('controlslist','nodownload')
        el.style.width = '75%'
        return el
    }

    function setFileAttributes(el, file) {
        el.className = 'application'
        el.innerText = file.name
        return el
    }

    function readFile(f) {
        const fileReader = new FileReader
        if (preview.current) {
            preview.current.innerHTML = ''
        }

        fileReader.addEventListener("load",function(){
            if (f.type.includes('image')) {
                let el = document.getElementById('img')
                if (!el)
                    el = document.createElement('img')
                if (type === 'normal') {
                    el = setImageAttributes(el)
                    el.src = fileReader.result
                    appendElementToPreview(el)
                } else {
                    el.style.width = 'inherit'
                    el.style.height = 'inherit'
                    el.style.borderRadius = 'inherit'
                    el.setAttribute('id','img')
                    el.src = fileReader.result
                    circlepreview.current.appendChild(el)
                }
            } else if (f.type.includes('video')) {
                let el = document.getElementById('video')
                if (!el)
                    el = document.createElement('video')
                el = setVideoAttributes(el)
                el.src = fileReader.result
                appendElementToPreview(el)
            } else if (f.type.includes('audio')) {
                let el = document.getElementById('audio')
                if (!el)
                    el = document.createElement('audio')
                el = setAudioAttributes(el)
                el.src = fileReader.result
                appendElementToPreview(el)
            } else if (f.type.includes('application')) {
                let el = document.getElementById('div')
                if (!el)
                    el = document.createElement('div')
                el = setFileAttributes(el, f)
                appendElementToPreview(el)
            } else {
                setMessage(`${f.name} is not acceptable`)
            }
        })
        
        fileReader.readAsDataURL(f)
    }

    return (
        <>
            <div className="w-full"
            >
                {(showRemove ? (file ? true
                    : false) : false) && <div className="text-sm absolute "
                    onClick={clickedRemove}
                >
                    <div className="w-auto p-1 bg-gray-700 text-cyan-100 rounded border-cyan-100 border-2 mt-1 mr-1 text-sm z-[1] cursor-pointer absolute">
                        remove
                    </div>
                </div>}
                {(type === 'normal') && <div className={`${middle ? 'w-full h-full' : ''} w-full text-center`}
                    ref={preview}
                ></div>}
                {(type === 'circle') && <div className="w-[150px] h-[150px] rounded-full flex justify-center items-center ml-auto bg-gray-700">
                    <div className="w-[130px] h-[130px] rounded-full" ref={circlepreview}></div>
                    {hasCircleImg && <div className="w-[130px] h-[130px] rounded-full" ref={circlepreviewimg}>
                        <img src={imgSrc} className="w-[130px] h-[130px] rounded-full object-cover" alt="profile pic"/>
                    </div>}
                </div>}
            </div>
        </>
    )
}