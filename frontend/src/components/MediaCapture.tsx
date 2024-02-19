import getBlobDuration from 'get-blob-duration';
import { useEffect, useRef, useState } from 'react';
import Modal from './Modal';
import Loader from './Loader';
import FilePreview from './FilePreview';

export default function MediaCapture(
    { 
        emitSendFile = null, maxSize = { video: 1 * 1024 * 1024, audio: 0.5 * 1024 * 1024 }, 
        maxTime = { video: '00:00:30', audio: '00:00:30', },
        show = false, type = '', closeMediaCapture = null,
        minTime = { video: '00:00:01', audio: '00:00:01' }
    } :
    { 
        emitSendFile: ((f: File | null) => void) | null;
        maxSize: { video: number; audio: number }; maxTime: { audio: string; video: string };
        show: boolean; type: string; closeMediaCapture: (() => void) | null;
        minTime: { video: string; audio: string }
    }
) {
    const mediacanvas = useRef(null)
    const mediavideo = useRef(null)
    const [checking, setChecking] = useState(false)
    const [mediaRecorder, setMediaRecorder] = useState(null)
    const [mediaChunk, setMediaChunk] = useState([])
    const [showPopUp, setShowPopUp] = useState(false)
    const [previewShow, setPreviewShow] = useState(false)
    const [stream, setStream] = useState<MediaStream | null>(null)
    const [buttonType, setButtonType] = useState('')
    const [audioState, setAudioState] = useState('')
    const [recordState, setRecordState] = useState('')
    const [popUpMessage, setPopUpMessage] = useState('')
    const [recorderType, setRecorderType] = useState('')
    const [file, setFile] = useState<File|null>(null)
    const [devices, setDevices] = useState([])
    const [width, setWidth] = useState(0)
    const [height, setHeight] = useState(0)
    const [camerasNumber, setCamerasNumber] = useState(0)
    const [constraints, setConstraints] = useState<{
        video:  {
            width: {
                ideal: number
            },
            height: {
                ideal: number
            },
            deviceId?: string | number
        } | boolean; audio: {
            echoCancellation: boolean
        } | boolean 
    }>({
        video:  {
            width: {
                ideal: 1280
            },
            height: {
                ideal: 720
            },
        }, audio: {
            echoCancellation: true
        }
    })
    const [trimMediaData, setTrimMediaData] = useState<{file: File|null, show: boolean}>({
        file: null,
        show: false
    })
    const [fileRequirement, setFileRequirement] = useState<{ doesntHaveAppropriateSize: boolean, doesntHaveAppropriateDuration: boolean }>(
        { doesntHaveAppropriateSize: false, doesntHaveAppropriateDuration: false}
    )

    useEffect(() => {
        if (type == '') {
            setRecordState('')
            return stopStream()
        }
        createConstraints()
        getEnumeratedDevices()
        getUserMedia()
    }, [type])

    useEffect(() => {
        if (!type) setButtonType('')
        if (!type && !stream) return

        if (file) return setButtonType('send')
        setButtonType('record')
    }, [type, stream])

    useEffect(() => {
        if (mediaRecorder && mediaRecorder?.state !== 'recording')
            mediaRecorder.start()
    }, [mediaRecorder])

    function createConstraints() {
        let c;
        if (type === 'image') {
            c = {video: {
                width: {
                    ideal: 1280
                },
                height: {
                    ideal: 720
                },
            }, audio: false}
        } else if (type === 'video') {
            c = {video:  {
                width: {
                    ideal: 1280
                },
                height: {
                    ideal: 720
                },
            }, audio: {
                echoCancellation: true
            }}
        } else if (type === 'audio') {
            c = {video: false, audio: {
                echoCancellation: true
            }}
        }

        setConstraints(c)
    }
    
    function clickedButton(str: string) {
        if (mediaRecorder?.state === 'recording') {
            setRecordState('stop recording')
            setAudioState('doneRecording')
            mediaRecorder.stop()
            return
        }
        
        if (str === 'record') {
            clickedRecord()
            return
        }

        clickedSend()
    }

    function clearTrimMediaData() {
        setTrimMediaData({
            file: null, show: false
        })
    }

    function getTrimmedFile(f) {
        if (f === 'close') {
            clearTrimMediaData()
            restart()
            return
        }

        sendFile(file)
    }
    function restart() {
        resetData()
        getUserMedia()
    }
    function videoStreamReady(){
        if (type !== 'image') {
            return
        }

        if (mediavideo.current) {
            setWidth(mediavideo.current.getClientRects()[0].width)
            setHeight((mediavideo.current.videoHeight/mediavideo.current.videoWidth) * width)

            mediavideo.current.setAttribute('width',width)
            mediavideo.current.setAttribute('height',height)
        }

        if (mediacanvas.current) {
            mediacanvas.current.setAttribute('width',width)
            mediacanvas.current.setAttribute('height',height)
        }
    }
    function clickedRemoveFile(){
        stopStream()
        getUserMedia()
        setFile(null)
        if (type === 'audio') {
            setAudioState('waiting to record')
        }
    }
    function clickedPopupResponse(text) {
        // closePopUp()
        
        if (text == 'trim') {
            setTrimMediaData({ file, show: true })
            return
        }
        
        if (text == 'cancel') {
            restart()
            return
        }
    }
    function sendFile(f: File | null) {
        if (emitSendFile) emitSendFile(f)
        setFile(null)
        mainModalDisappear()
    }
    async function clickedSend(){

        if (type === 'image') {
            sendFile(file)
            return
        }

        setChecking(true)

        setFileRequirements(
            await getBlobDuration(file)
        )

        setChecking(false)

        if (fileRequirement.doesntHaveAppropriateDuration) {
            displayPopUp('duration')
            return
        }

        if (fileRequirement.doesntHaveAppropriateSize) {
            displayPopUp('size')
            return
        }

        sendFile(file)
    }
    function setFileRequirements(duration) {

        resetFileRequirements()

        if (! ['video', 'audio'].includes(type)) {
            return
        }

        // duration = getFormattedDuration(duration)
        let doesntHaveAppropriateSize = false
        let doesntHaveAppropriateDuration = false
        if (! hasAppropriateSize(file, type)) {
            doesntHaveAppropriateSize = true
        }

        if (! hasAppropriateDuration(duration, type)) {
            doesntHaveAppropriateDuration = true
        }

        setFileRequirement({
            doesntHaveAppropriateDuration, doesntHaveAppropriateSize
        })
    }
    function resetFileRequirements() {
        setFileRequirement({
            doesntHaveAppropriateDuration: false, doesntHaveAppropriateSize: false
        })
    }
    function displayPopUp(t: string) {

        if (t === 'size') {
            setPopUpMessage(`the size of the ${type} should be less than ${maxSize[type]}. trim the file or cancel to delete`)
        }
         
        if (t === 'duration') {
            setPopUpMessage(`the duration of the ${type} should be less than ${maxTime[type]}. trim the file or cancel to delete`)
        }

        setShowPopUp(true)
    }
    function clickedRecord(){
        if (type === 'image') {
            snap()
            setButtonType('send')
            return
        }

        setPreviewShow(false)
        setFile(null)

        if (type === 'audio') {
            setAudioState('recording')
        }

        setRecordState('recording')
        
        if (type == 'video') record('video/webm')
        if (type == 'audio') record('audio/mp3')
    }
    function clickedSwitch(){
        if (camerasNumber < devices.length -1) {
            setCamerasNumber( camerasNumber + 1)
        } else {
            setCamerasNumber(0)
        }
        
        if (type === 'audio') {
            setAudioState('recording')
        }
        setConstraints(oldData => {
            const newData = { ...oldData }

            newData.video.deviceId = devices[camerasNumber].deviceId

            return newData
        })

        stopStream()
        getUserMedia()
    }
    function mainModalDisappear(){
        if (mediaRecorder?.state == 'recording') mediaRecorder.stop()
        if (stream) stopStream()
        if (closeMediaCapture) closeMediaCapture()
    }
    function resetData() {
        setFile(null)
        setButtonType('')
        setStream(null)
    }
    function stopStream() {
        if(!stream) return
        stream.getTracks().forEach(track=>{
            track.stop()
        })

        if (mediavideo.current) mediavideo.current.srcObject = null
    }
    async function getUserMedia(){
        await navigator.mediaDevices.getUserMedia(constraints)
            .then(strm=>{
                if (type === 'audio') {
                    setAudioState('waiting to record')
                    
                    return
                }

                setButtonType('record')

                if (videoIsStreaming()) {
                    return
                }
                 
                setStream(strm)

                if (mediavideo.current) {
                    mediavideo.current.srcObject =  strm
                    mediavideo.current.play()
                }
            })
            .catch(err=>{
                
            })
    }
    function videoIsStreaming() {
        if (type === 'audio') {
            return false
        }

        if (mediavideo.current?.srcObject || 
            mediavideo.current?.src?.length) {
            return true
        }

        return false
    }
    function record(t: string){
        setRecorderType(t)
        
    }

    useEffect(() => {
        if (recorderType) startRecording()
    }, [recorderType])

    function startRecording() {
        const recorder = new MediaRecorder(stream)

        recorder.onstart = ev=>{
            
        }

        let chunks = []
        recorder.ondataavailable = ev=>{
            
            chunks.push(ev.data)
        }

        recorder.onstop = (ev)=>{
            setFile(new Blob(chunks, {'type': recorderType}))
            setMediaChunk([])
            setPreviewShow(true)

            stopStream()

            setButtonType('send')
        }

        setMediaRecorder(recorder)
    }
    function snap(){
        const context = mediacanvas.current.getContext('2d')

        mediacanvas.current.width = width
        mediacanvas.current.height = height

        context.drawImage(mediavideo.current,0,0,width,height)
        mediacanvas.current.toBlob(blob=>{
            setFile(blob)
        },'image/png')
    }
    function getEnumeratedDevices(){
        navigator.mediaDevices.enumerateDevices()
            .then(d=>{
                d.forEach(device=>{
                    // let option = document.createElement("option")
                    
                    if (device.kind.includes(type == 'image' ? 'video' : type)) {
                        setDevices((oldDevices) => {
                            return [...oldDevices, device]
                        })
                    }
                    
                    //add details to option and append to parent
                })
            })
    }

    function getFormattedDuration(duration) {
        if (! duration) {
            return
        }

        duration = parseFloat(duration.toFixed(2))
        
        const hours = Math.floor(duration / 3600)
        const minites = Math.floor((duration - (hours * 3600)) / 60)
        const seconds = duration - (hours * 3600 + minites * 60)

        return `${formatTimeUnit(hours)}:${formatTimeUnit(minites)}:${formatTimeUnit(seconds.toFixed(0))}`
    }
    function hasAppropriateSize(f, fileType) {

        return f.size <= maxSize[fileType]
    }
    function hasAppropriateDuration(duration, fileType) {
        return duration < maxTime[fileType]
    }
    function formatTimeUnit(unit) {
        return unit < 10 ? `0${unit}` : unit
    }
    function issueUploadedFileDangerAlert({ alertType, message }) {
        let fileType = getUploadedFileType(file)

        if (! fileType) {
            return
        }

        if (alertType === 'fileSize') {
            message = `the size of the ${fileType} should be less than ${maxSize[fileType]}`    
        }

        if (alertType === 'duration') {
            message = `the duration of the ${fileType} should be between ${maxTime[fileType]} && ${minTime[fileType]}`    
        }

        // if (issueDangerAlert) issueDangerAlert({message})
    }
    function getUploadedFileType(f) {

        if (f?.type.match('audio/*')?.length) {
            return 'audio'
        }

        if (f?.type.match('video/*')?.length) {
            return 'video'
        }

        return null
    }
    

    return (
        <>
            <Modal
                show={show}
                className="z-50"
                close={mainModalDisappear}
            >
                <div className='relative'>
                    <div className="media-container relative">
                        {(file ? false : ((type === 'image' || type === 'video') ? true : false)) && <div className="video-container">
                            <video autoPlay ref={mediavideo}
                                onCanPlay={videoStreamReady}
                                onResize={videoStreamReady}
                                muted
                            >your device does not support this</video>
                        </div>}
                        {(file ? false : (type === 'audio' ? true : false)) && <div className="audio-container">
                            <div className="recorder">
                                <div className="state">
                                    {audioState}
                                </div>
                                {audioState === 'recording' && <Loader
                                    className=''
                                    switchAppearance={false}
                                >loading ...</Loader>}
                            </div>
                        </div>}

                        {file && <FilePreview
                            file={file}
                            middle={true}
                            removeFile={clickedRemoveFile}
                        ></FilePreview>
                        }
                        {/* {(file && type == 'video') && <video autoPlay src={URL.createObjectURL(file)}>file not support</video>} */}
                        <canvas ref={mediacanvas} className="hidden"></canvas>
                        {(devices.length > 1 && !file) && <div className="absolute bg-gray-700 text-cyan-100 top-0 right-0 z-[1] p-1 cursor-pointer rounded"
                            onClick={clickedSwitch}
                            title="change camera"
                        >switch</div>}
                        
                    </div>

                    {/* <pop-up
                        :show="showPopUp"
                        :responses="['trim', 'cancel']"
                        default="cancel"
                        :message="popUpMessage"
                        @clickedResponse="clickedPopupResponse"
                        @closePopUp="closePopUp"
                    ></pop-up> */}

                    {checking && <div className="z-50 text-white absolute bottom-0 w-full text-center">
                        checking for duration...
                    </div>}
                    <div className="w-full absolute bottom-1">
                        <div className=''></div>
                        {(!file && buttonType == 'record') && <div className={`${recordState === 'recording' ? 'bg-gray-400' : 'bg-gray-700'} flex justify-center items-center transition duration-75 relative w-[40px] h-[40px] mx-auto cursor-pointer rounded-full`}
                            onClick={() => clickedButton('record')} 
                            title=''
                        >
                            <div className={`${recordState === 'recording' ? 'bg-red-400' : 'bg-gray-400'} transition duration-75 w-[30px] h-[30px] rounded-full`}></div>    
                        </div>}
                        {(file && !checking && buttonType == 'send') && 
                            <div 
                                className="w-[40px] h-[40px] rounded-full flex justify-center items-center text-xl cursor-pointer mx-auto bg-green-700 text-green-300" 
                                onClick={() => clickedButton('send')}>
                                <div>+</div>
                            </div>
                        }
                    </div>
                </div>

            </Modal>
        </>
    )
}