import { MeetingProvider, useMeeting, useParticipant } from "@videosdk.live/react-sdk";
import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Button, Spin } from "antd";
import { PhoneOff, Mic, MicOff, Video, VideoOff, Users } from "lucide-react";
import { VIDEOSDK_CONFIG } from "../../../config/videosdk.config";
import activityScheduleService from "../../../services/activityScheduleService";
import { useNotification } from "../../../contexts/NotificationContext";

const HostLiveStream: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { toastSuccess } = useNotification();
  
  const activityScheduleId = location.state?.activityScheduleId;
  const activityName = location.state?.activityName;

  const handleLeaveMeeting = async () => {
    if (activityScheduleId) {
      try {
        await activityScheduleService.updateLiveStreamStatus(
          activityScheduleId,
          false
        );
        toastSuccess("Kết thúc", "Đã kết thúc livestream");
      } catch (error) {
        console.warn("Could not update livestream status on leave (skipping):", error);
      }
    }
    navigate("/staff/calendar");
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <MeetingProvider
        config={{
          meetingId: roomId!,
          micEnabled: true,
          webcamEnabled: true,
          name: "Host",
          debugMode: false,
        }}
        token={VIDEOSDK_CONFIG.authToken}
      >
        <MeetingView
          onMeetingLeave={handleLeaveMeeting}
          activityName={activityName}
        />
      </MeetingProvider>
    </div>
  );
};

const MeetingView: React.FC<{
  onMeetingLeave: () => void;
  activityName?: string;
}> = ({ onMeetingLeave, activityName }) => {
  const [joined, setJoined] = useState<string | null>(null);
  const { join, leave, toggleMic, toggleWebcam, participants } = useMeeting({
    onMeetingJoined: () => setJoined("JOINED"),
    onMeetingLeft: () => onMeetingLeave(),
  });
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);

  const joinMeeting = () => {
    setJoined("JOINING");
    join();
  };

  const handleMicToggle = () => {
    toggleMic();
    setMicOn(!micOn);
  };

  const handleCamToggle = () => {
    toggleWebcam();
    setCamOn(!camOn);
  };

  if (joined === "JOINED") {
    return (
      <div className="min-h-screen flex flex-col">
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
            <p className="text-gray-400 mt-1">{activityName}</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-white">
              <Users size={20} />
              <span>{participants.size} người xem</span>
            </div>
          </div>
        </div>

        {/* Video Grid */}
        <div className="flex-1 p-4 overflow-hidden flex gap-4">
          {/* Main Host Video - Large Center */}
          <div className="flex-1 flex items-center justify-center bg-gray-950">
            {[...participants.keys()].filter((id, index) => index === 0).map((participantId) => (
              <div key={participantId} className="w-full h-full flex items-center justify-center">
                <ParticipantView participantId={participantId} isMainView={true} />
              </div>
            ))}
          </div>
          
          {/* Sidebar for other viewers */}
          {participants.size > 1 && (
            <div className="w-72 flex-shrink-0 overflow-y-auto flex flex-col gap-3">
              {[...participants.keys()].filter((id, index) => index > 0).map((participantId) => (
                <ParticipantView key={participantId} participantId={participantId} isMainView={false} />
              ))}
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="bg-gray-800 p-6">
          <div className="flex justify-center gap-4">
            <button
              onClick={handleMicToggle}
              className={`p-4 rounded-full transition-colors ${
                micOn ? "bg-gray-700 hover:bg-gray-600" : "bg-red-500 hover:bg-red-600"
              }`}
              title={micOn ? "Tắt mic" : "Bật mic"}
            >
              {micOn ? <Mic size={24} color="white" /> : <MicOff size={24} color="white" />}
            </button>
            
            <button
              onClick={handleCamToggle}
              className={`p-4 rounded-full transition-colors ${
                camOn ? "bg-gray-700 hover:bg-gray-600" : "bg-red-500 hover:bg-red-600"
              }`}
              title={camOn ? "Tắt camera" : "Bật camera"}
            >
              {camOn ? <Video size={24} color="white" /> : <VideoOff size={24} color="white" />}
            </button>
            
            <button
              onClick={leave}
              className="p-4 rounded-full bg-red-600 hover:bg-red-700 transition-colors"
              title="Kết thúc livestream"
            >
              <PhoneOff size={24} color="white" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (joined === "JOINING") {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <Spin size="large" />
          <p className="text-white mt-4 text-lg">Đang bắt đầu livestream...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="text-center">
        <h2 className="text-white text-2xl mb-4">{activityName}</h2>
        <Button
          onClick={joinMeeting}
          size="large"
          className="bg-red-500 hover:bg-red-600 border-red-500 hover:border-red-600 text-white"
        >
          Bắt đầu livestream
        </Button>
      </div>
    </div>
  );
};

const ParticipantView: React.FC<{ participantId: string; isMainView?: boolean }> = ({ participantId, isMainView = false }) => {
  const { webcamStream, webcamOn, micOn, displayName } = useParticipant(participantId);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (webcamStream && videoRef.current && webcamOn) {
      const mediaStream = new MediaStream();
      mediaStream.addTrack(webcamStream.track);
      videoRef.current.srcObject = mediaStream;
      videoRef.current.play().catch((err) => console.error("Error playing video:", err));
    }
  }, [webcamStream, webcamOn]);

  return (
    <div className={`relative bg-gray-800 rounded-lg overflow-hidden ${
      isMainView ? "w-full h-full max-h-[calc(100vh-200px)]" : "aspect-video"
    }`}>
      {webcamOn && webcamStream ? (
        <video ref={videoRef} autoPlay className="w-full h-full object-contain" />
      ) : (
        <div className="flex items-center justify-center h-full bg-gray-700">
          <span className={`text-white ${
            isMainView ? "text-8xl" : "text-2xl"
          }`}>{displayName?.[0] || "?"}</span>
        </div>
      )}
      <div className="absolute bottom-2 left-2 bg-black/70 px-3 py-1 rounded text-white text-sm flex items-center gap-2">
        <span>{displayName || "Unknown"}</span>
        {!micOn && <MicOff size={16} className="text-red-400" />}
      </div>
    </div>
  );
};

export default HostLiveStream;
