import './App.css'
import MyPlayerWithVisualization from './components/Reproductor';

function App() {
  const myAudioFile = "/NoticieroTest.wav"
  return (
    <div>
      <h1>My React Audio Player</h1>
      <MyPlayerWithVisualization audioSrc={myAudioFile} />
    </div>
  );
}

export default App
