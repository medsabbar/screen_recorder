import { useCallback, useEffect, useRef, useState } from "react";
import "./App.css";

function App() {
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
      });
      videoRef.current.srcObject = stream;
      const recorder = new MediaRecorder(stream, {
        mimeType: "video/webm",
      });
      recorder.ondataavailable = (e) => {
        console.log("data available", e.data);
        if (e.data.size > 0) {
          setVideoChunks((prev) => [...prev, e.data]);
        }
      };
      setRecorder(recorder);
      setCaptureStream(stream);
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

  const handleDownload = useCallback((url) => {
    const a = document.createElement("a");
    a.href = url;
    a.download = "stream.webm";
    a.click();
    videoRef.current.controls = true;
    videoRef.current.src = url;
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
      videoRef.current.srcObject = null;
      videoRef.current.src = new URL.createObjectURL(
        new Blob(videoChunks, {
          type: "video/webm",
        })
      );
    }
  }, [captureStream, recorder, videoChunks]);

  useEffect(() => {
    if (captureStream && timer) {
      setTimerStarted(true);
      const interval = setInterval(() => {
        setTimer((prev) => {
          if (prev < 1) {
            if (recorder?.state !== "recording") handleStartRecording();
            clearInterval(interval);
            setTimerStarted(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
  }, [
    handleStartRecording,
    handleStartStream,
    captureStream,
    timer,
    recorder?.state,
  ]);

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
        console.log("beforeunload");
        captureStream.getTracks().forEach((track) => track.stop());
        setCaptureStream(undefined);
        setRecorder(null);
        setRecording(false);
        setTimer(3);
        videoRef.current.srcObject = null;
        videoRef.current.src = new URL.createObjectURL(new Blob(videoChunks));
      }
    };
    window.addEventListener("beforeunload", handleWindowClose);
    return () => {
      window.removeEventListener("beforeunload", handleWindowClose);
    };
  }, [captureStream, videoChunks]);

  // log all the stats
  console.log("captureStream", captureStream);
  console.log("recorder", recorder);
  console.log("videoChunks", videoChunks);
  console.log("recording", recording);
  console.log("timer", timer);
  console.log("timerStarted", timerStarted);

  useEffect(() => {
    if (recording) {
      console.log("recording started");
      videoRef.current.srcObject = captureStream;
      videoRef.current.autoplay = true;
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
    <div className="grid">
      <h1>Screen Recorder</h1>
      <button
        style={{
          maxWidth: "200px",
          margin: "0 auto",
        }}
        onClick={recording ? handleStopStream : handleStartStream}
      >
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
            style={{
              top: "0px",
              right: "30px",
              border: "black 1px solid",
            }}
            onClick={() => handleDownload(videoRef.current.src)}
          >
            Download
          </button>
        ) : null}
      </div>
      {timerStarted && timer ? (
        <div className="modal">
          <h1 className="modal-content">{timer}</h1>
        </div>
      ) : null}
    </div>
  );
}

export default App;
