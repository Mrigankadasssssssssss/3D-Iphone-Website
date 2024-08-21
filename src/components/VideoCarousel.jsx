
import { useEffect, useRef, useState } from "react"
import { hightlightsSlides } from "../constants"
import gsap from "gsap";
import { pauseImg, playImg, replayImg } from "../utils";
import { useGSAP } from "@gsap/react";


const VideoCarousel = () => {
    const vdoRef = useRef([]);
    const vdoSpanRef = useRef([]);
    const vdoDivRef = useRef([]);

    const [vdo, setVdo] = useState({
        isEnd:false,
        startPlay:false,
        vdoId : 0,
        isLastVdo : false,
        isPlaying : false,
    })
    const [loadedData, setLoadedData] = useState([])
    const {isEnd,isLastVdo,startPlay,vdoId,isPlaying} = vdo;
    useGSAP(()=>{
        gsap.to("#slider",{
            transform:`translateX(${-100*vdoId}%)`,
            duration:2,
            ease:"power2.inOut"
        })
        gsap.to("#vdo",{
            scrollTrigger:{
                trigger:'#vdo',
                toggleActions:'restart none none none'
            },
            onComplete:()=>{
                setVdo((pre)=>({...pre,startPlay:true,isPlaying:true}))
            }
        })
    },[isEnd,vdoId])
    useEffect(()=>{
        if(loadedData.length>3){
            if(!isPlaying){
                vdoRef.current[vdoId].pause();
            }else{
                startPlay && vdoRef.current[vdoId].play();
            }
        }
    },[startPlay,vdoId,isPlaying,loadedData])
    const handleLoadedMetaData = (i,e)=>setLoadedData((pre)=>[...pre,e])
    useEffect(()=>{
        let currentProg = 0;
        let span = vdoSpanRef.current;
        if(span[vdoId]){
            let anim = gsap.to(span[vdoId],{
                onUpdate:()=>{
                    const progress = Math.ceil(anim.progress()*100)
                    if(progress != currentProg){
                        currentProg = progress;
                        gsap.to(vdoDivRef.current[vdoId],{
                            width:window.innerWidth<760
                            ? '10vw' : window.innerWidth<1200?'10vw':'4vw'
                        })
                        gsap.to(span[vdoId],{
                            width:`${currentProg}%`,
                            backgroundColor : '#9fd6b5'
                        })
                    }
                },
                onComplete:()=>{
                    if(isPlaying){
                        gsap.to(vdoDivRef.current[vdoId],{
                            width:'12px'
                        })
                        gsap.to(span[vdoId],{
                            backgroundColor : '#afafaf'
                        })
                        
                    }
                }
            });
            if(vdoId === 0){
                anim.restart();
            }

            const animUpdate = ()=>{
                anim.progress(vdoRef.current[vdoId].currentTime/hightlightsSlides[vdoId].videoDuration)
            }
            if(isPlaying){
                gsap.ticker.add(animUpdate)
            }else{
                gsap.ticker.remove(animUpdate)
            }
        }
    },[vdoId,startPlay])
    const handleProcess = (type,i)=>{
        switch (type) {
            case 'video-end':
                setVdo((prevVdo)=>({...prevVdo,isEnd:true,vdoId:i+1}))
                break;
            case 'video-last':
                setVdo((prevVdo)=>({...prevVdo,isLastVdo:true}))
                break;
        
            case 'video-reset':
                setVdo((prevVdo)=>({...prevVdo,isLastVdo:false,vdoId:0}))
                break;
            case 'play':
                setVdo((prevVdo)=>({...prevVdo,isPlaying:!prevVdo.isPlaying}))
                break;
            case 'pause':
                setVdo((prevVdo)=>({...prevVdo,isPlaying:!prevVdo.isPlaying}))
                break;
        
            default:
                return vdo
        }
    }
  return (
    <>
      <div className="flex items-center">
        {hightlightsSlides.map((list,i)=>(
            <div key={list.id} id="slider" className="sm:pr-20 pr-10">
                <div className="video-carousel_container">
                    <div className="w-full h-full flex-center rounded-3xl overflow-hidden bg-black">
                        <video
                        id="vdo"
                        playsInline={true}
                        preload="auto"
                        muted
                        ref={(el)=>(
                            vdoRef.current[i] = el
                        )}
                       onEnded={() =>
                        i !== 3 ? handleProcess('video-end',i):handleProcess('video-last')
                       }
                        onPlay={()=>{
                            setVdo((prevVdo)=>({...prevVdo,isPlaying:true}))
                        }}
                        onLoadedMetadata={(e) => handleLoadedMetaData(i,e)}
                        className={`${list.id === 2 && 'translate-x-44'} pointer-events-none `}
                        >
                            <source src={list.video} type="video/mp4"/>
                        </video>
                    </div>
                    <div className="absolute top-12 left-[5%] z-10">
                        {list.textLists.map((text)=>(
                            <p key={text} className="md:text-2xl text-xl font-medium">
                                {text}
                            </p>
                        ))}
                    </div>
                </div>
            </div>
        ))}
      </div>
      <div className="relative flex-center mt-10">
        <div className="flex-center py-5 px-7 bg-gray-300 backdrop-blur rounded-full">
            {vdoRef.current.map((_,i)=>(
                <span key={i} ref={(el)=>(vdoDivRef.current[i] = el)} className="mx-2 w-3 h-3 rounded-full relative cursor-pointer bg-gray-200">
                    <span className="absolute h-full w-full rounded-full" ref={(el)=>(vdoSpanRef.current[i] = el)}/>
                </span>
            ))}
        </div>
        <button className="control-btn">
            <img src={isLastVdo ? replayImg : !isPlaying?playImg:pauseImg}
            alt="control btn"
            onClick={isLastVdo ? ()=> handleProcess('video-reset'):!isPlaying?()=>handleProcess('play'):()=>handleProcess('pause')}
            />
        </button>
      </div>
    </>
  )
}

export default VideoCarousel
