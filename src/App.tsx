import "./App.css";
import Footer from "./Components/Footer";
import Recorder from "./Components/Recorder";

function App() {
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
    <div className="w-full min-h-screen flex flex-col justify-between">
      <Recorder />
      <Footer />
    </div>
  );
}

export default App;
