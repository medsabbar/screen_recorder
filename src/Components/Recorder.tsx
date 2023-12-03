import { useCallback, useEffect, useRef, useState } from "react";
import { FaDownload, FaPlay, FaRegStopCircle } from "react-icons/fa";

function Recorder() {
  const [captureStream, setCaptureStream] = useState<MediaStream>();
  const [recorder, setRecorder] = useState<MediaRecorder | null>(null);
  const [videoChunks, setVideoChunks] = useState<Blob[]>([]); // [Blob, Blob, Blob]
  const [recording, setRecording] = useState<boolean>(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [timer, setTimer] = useState<number>(3);
  const [timerStarted, setTimerStarted] = useState<boolean>(false);

  const handleStartStream = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true,
      });
      if (videoRef.current) videoRef.current.srcObject = stream;
      const recorder = new MediaRecorder(stream, {
        mimeType: "video/webm",
      });
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          setVideoChunks((prev) => [...prev, e.data]);
        }
      };
      setRecorder(recorder);
      setCaptureStream(stream);
      setTimerStarted(true);
    } catch (err) {
      console.log(err);
    }
  }, []);

  const handleStartRecording = useCallback(() => {
    if (captureStream) {
      console.log("handleStartRecording");
      setRecording(true);
      recorder?.start();
    }
  }, [captureStream, recorder]);

  const handleDownload = useCallback((url: string) => {
    const a = document.createElement("a");
    a.href = url;
    a.download = "stream.webm";
    a.click();
    if (videoRef.current) {
      videoRef.current.controls = true;
      videoRef.current.src = url;
    }
  }, []);

  const handleStopStream = useCallback(() => {
    setRecording(false);
    setTimer(3);
    if (captureStream) {
      // save the stream to a file then stop the stream
      recorder?.stop();
      captureStream.getTracks().forEach((track) => track.stop());
      setCaptureStream(undefined);
      // set the video src to the video chunks
      if (videoRef.current) {
        videoRef.current.srcObject = null;
        const blob = new Blob(videoChunks, {
          type: "video/webm",
        });
        videoRef.current.src = URL.createObjectURL(blob);
      }
    }
  }, [captureStream, recorder, videoChunks]);

  useEffect(() => {
    if (!captureStream) return;
    const interval = setInterval(() => {
      if (timer > 0) {
        setTimer((prev) => prev - 1);
      } else {
        setTimerStarted(false);
        clearInterval(interval);
        handleStartRecording();
        setTimer(3);
      }
    }, 1000);
    return () => {
      clearInterval(interval);
    };
  }, [handleStartRecording, captureStream, timer, recorder?.state]);

  useEffect(() => {
    if (!recording && videoChunks.length > 0) {
      const blob = new Blob(videoChunks, {
        type: "video/webm",
      });
      const url = URL.createObjectURL(blob);
      handleDownload(url);
    }
  }, [handleDownload, recording, videoChunks]);

  // add event listener to the window to stop the stream when the window is closed
  useEffect(() => {
    const handleWindowClose = () => {
      if (captureStream) {
        captureStream.getTracks().forEach((track) => track.stop());
        setCaptureStream(undefined);
        setRecorder(null);
        setRecording(false);
        setTimer(3);
        if (videoRef.current) {
          videoRef.current.srcObject = null;
          const blob = new Blob(videoChunks, {
            type: "video/webm",
          });
          const src = URL.createObjectURL(blob);
          videoRef.current.src = src;
        }
      }
    };
    window.addEventListener("beforeunload", handleWindowClose);
    return () => {
      window.removeEventListener("beforeunload", handleWindowClose);
    };
  }, [captureStream, videoChunks]);

  useEffect(() => {
    if (recording) {
      if (videoRef.current) {
        videoRef.current.srcObject = captureStream ?? null;
        videoRef.current.autoplay = true;
      }
    }
  }, [captureStream, recording]);

  // check if the browser supports screen recording

  const supportsRecording = navigator?.mediaDevices?.getDisplayMedia;
  if (!supportsRecording) {
    alert("Your browser does not support screen recording");
    return (
      <div>
        <h1>Your browser does not support screen recording</h1>
      </div>
    );
  }

  return (
    <div className="grid flex-1 items-center my-12">
      <h1 className="font-bold text-5xl text-center">Screen Recorder</h1>
      <button
        style={{
          maxWidth: "200px",
          margin: "0 auto",
        }}
        className="shadow flex justify-center items-center gap-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        onClick={recording ? handleStopStream : handleStartStream}
      >
        {recording ? <FaRegStopCircle /> : <FaPlay />}
        {recording ? "Save" : "Start"} Recording
      </button>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          gap: "10px",
        }}
      >
        <video
          autoPlay
          ref={videoRef}
          style={{
            width: "80%",
            height: "100%",
            opacity: timerStarted ? 0 : 1,
          }}
        />
        {!recording && videoChunks.length > 0 ? (
          <button
            className="shadow flex justify-center items-center gap-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            onClick={() =>
              videoRef.current && handleDownload(videoRef.current.src)
            }
          >
            <FaDownload />
            Download
          </button>
        ) : null}
      </div>
      {timerStarted && timer ? (
        <div className="modal">
          <h1 className="modal-content text-3xl">{timer}</h1>
        </div>
      ) : null}
    </div>
  );
}

export default Recorder;
