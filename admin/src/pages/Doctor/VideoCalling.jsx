import React, { useEffect, useRef } from "react";
import { AiOutlineClose } from "react-icons/ai";
import Peer from "peerjs";

const streamConfig = {
    video: true,
    // audio: true,
}

const VideoCalling = ({
    name,
    remotePeerId,
    onEndCall,
    onStartCall
}) => {
    const localVideoRef = useRef();
    const remoteVideoRef = useRef();

    const localStreamRef = useRef();
    const callRef = useRef();
    const peerjs = useRef();

    const initializeLocalStream = async () => {
        return navigator.mediaDevices.getUserMedia(streamConfig).catch((error) => {
            console.log("Failed to access local media devices:", error)
        })
    }

    const createMeeting = (stream) => {
        peerjs.current = new Peer();

        peerjs.current.on('open', (id) => {
            onStartCall(id);
        });

        peerjs.current.on('call', (call) => {
            call.answer(stream);

            call.on('stream', (remoteStream) => {
                remoteVideoRef.current.srcObject = remoteStream;
            });

            callRef.current = call;

            callRef.current.on("close", () => {
                onEndCall();
            });
        });

        peerjs.current.on('error', (error) => {
            onEndCall();
            console.error("Peer error:", error);
        });
    }

    const joinMeeting = (id, stream) => {
        peerjs.current = new Peer();

        peerjs.current.on('open', () => {
            callRef.current = peerjs.current.call(id, stream);

            callRef.current.on('stream', (remoteStream) => {
                remoteVideoRef.current.srcObject = remoteStream;
            })

            callRef.current.on("close", () => {
                onEndCall();
            });
        })

        peerjs.current.on('error', (error) => {
            onEndCall();
            console.error("Peer error:", error);
        });
    }

    useEffect(() => {
        initializeLocalStream().then((stream) => {
            localVideoRef.current.srcObject = localStreamRef.current = stream;
            remotePeerId ? joinMeeting(remotePeerId, stream) : createMeeting(stream);
        })

        return () => {
            if (localStreamRef.current) {
                localStreamRef.current.getTracks().forEach((track) => track.stop());
            }

            if (peerjs.current) {
                peerjs.current.destroy();
            }
        }
    }, [remotePeerId, localStreamRef, peerjs])

    return (
        <div className="flex-1 flex flex-col">
            <div className="flex items-center justify-between p-4 border-b">
                <h3 className="text-lg font-medium">Video Call with {name}</h3>
                <button onClick={onEndCall} className="text-gray-600 hover:text-gray-900">
                    <AiOutlineClose size={20} />
                </button>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center gap-4">
                <video
                    ref={localVideoRef}
                    className="w-full max-w-lg aspect-video h-72 bg-black rounded-lg"
                    playsInline
                    autoPlay
                ></video>
                <video
                    ref={remoteVideoRef}
                    className="w-32 h-32 aspect-video bg-black rounded-lg"
                    playsInline
                    muted
                    autoPlay
                ></video>
            </div>

            <div className="p-4 border-t flex justify-center gap-4">
                <button
                    onClick={onEndCall}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                >
                    End Call
                </button>
            </div>
        </div>
    );
}

export default VideoCalling;

