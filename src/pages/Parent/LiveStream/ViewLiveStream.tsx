import { MeetingProvider, useMeeting, useParticipant } from "@videosdk.live/react-sdk";
import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button, Spin } from "antd";
import { PhoneOff, Users, MicOff } from "lucide-react";
import { VIDEOSDK_CONFIG } from "../../../config/videosdk.config";

const ViewLiveStream: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-900">
      <MeetingProvider
        config={{
          meetingId: roomId!,
          micEnabled: false,
          webcamEnabled: false,
          name: "Viewer",
          debugMode: false,
        }}
        token={VIDEOSDK_CONFIG.authToken}
      >
        <ViewerMeetingView onLeave={() => navigate(-1)} />
      </MeetingProvider>
    </div>
  );
};

const ViewerMeetingView: React.FC<{ onLeave: () => void }> = ({ onLeave }) => {
  const [joined, setJoined] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasJoinedRef = useRef(false);
  
  const { join, leave, participants } = useMeeting({
    onMeetingJoined: () => {
      console.log("[Viewer] Meeting joined successfully");
      setJoined(true);
      setError(null);
    },
    onMeetingLeft: () => {
      console.log("[Viewer] Meeting left");
      // Only navigate if user clicked leave button, not on errors
      if (!error) {
        onLeave();
      }
    },
    onError: (err: any) => {
      console.error("[Viewer] Meeting error:", err);
      setError(err?.message || "Không thể kết nối livestream");
    },
  });

  useEffect(() => {
    // Only join once when component mounts
    if (!hasJoinedRef.current) {
      hasJoinedRef.current = true;
      console.log("[Viewer] Attempting to join meeting");
      join();
    }
  }, []); // Empty dependency - join only once

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen ">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-white text-2xl mb-2">Không thể tham gia livestream</h2>
          <p className="text-gray-400 mb-6">{error}</p>
          <Button onClick={onLeave}>Quay lại</Button>
        </div>
      </div>
    );
  }

  if (!joined) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <Spin size="large" />
          <p className="text-white mt-4 text-lg">Đang tham gia livestream...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col pt-15">
      {/* Header */}
      <div className="bg-gray-800 p-4 flex justify-between items-center">
        <div>
          <div className="flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
            </span>
            <h2 className="text-2xl font-bold text-white">LIVE</h2>
          </div>
          <p className="text-gray-400 mt-1">Hoạt động trực tiếp</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-white">
            <Users size={20} />
            <span>{participants.size} người xem</span>
          </div>
          <Button
            onClick={leave}
            danger
            icon={<PhoneOff size={16} />}
          >
            Rời khỏi
          </Button>
        </div>
      </div>

      {/* Video Grid */}
      <div className="flex-1 p-4 overflow-hidden flex gap-4">
        {/* Main Host Video - Large Center */}
        <div className="flex-1 flex items-center justify-center bg-gray-950">
          {[...participants.keys()].map((participantId) => (
            <HostVideoDisplay key={participantId} participantId={participantId} />
          ))}
        </div>
      </div>
    </div>
  );
};

const HostVideoDisplay: React.FC<{ participantId: string }> = ({ participantId }) => {
  const { displayName } = useParticipant(participantId);
  
  // Only render if this is the host
  if (displayName !== "Host") {
    return null;
  }

  return (
    <div className="w-full h-full flex items-center justify-center">
      <ParticipantView participantId={participantId} isMainView={true} />
    </div>
  );
};

const ParticipantView: React.FC<{ participantId: string; isMainView?: boolean }> = ({ participantId, isMainView = false }) => {
  const { webcamStream, webcamOn, micStream, micOn, displayName } = useParticipant(participantId);
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Handle video stream
  useEffect(() => {
    if (webcamStream && videoRef.current && webcamOn) {
      const mediaStream = new MediaStream();
      mediaStream.addTrack(webcamStream.track);
      videoRef.current.srcObject = mediaStream;
      videoRef.current.play().catch((err) => console.error("Error playing video:", err));
    }
  }, [webcamStream, webcamOn]);

  // Handle audio stream separately
  useEffect(() => {
    if (micStream && audioRef.current) {
      const audioMediaStream = new MediaStream();
      audioMediaStream.addTrack(micStream.track);
      audioRef.current.srcObject = audioMediaStream;
      audioRef.current.play().catch((err) => console.error("Error playing audio:", err));
    }
  }, [micStream]);

  return (
    <div className={`relative bg-gray-800 rounded-lg overflow-hidden ${
      isMainView ? "w-full h-full max-h-[calc(100vh-200px)]" : "aspect-video"
    }`}>
      {webcamOn && webcamStream ? (
        <>
          <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-contain" />
          <audio ref={audioRef} autoPlay />
        </>
      ) : (
        <div className="flex items-center justify-center h-full bg-gray-700">
          <span className={`text-white ${
            isMainView ? "text-8xl" : "text-4xl"
          }`}>{displayName?.[0] || "?"}</span>
          <audio ref={audioRef} autoPlay />
        </div>
      )}
      <div className="absolute bottom-2 left-2 bg-black/70 px-3 py-1 rounded text-white text-sm flex items-center gap-2">
        <span>{displayName || "Unknown"}</span>
        {!micOn && <MicOff size={16} className="text-red-400" />}
      </div>
    </div>
  );
};

export default ViewLiveStream;
