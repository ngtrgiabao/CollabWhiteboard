import { useState } from 'react'
import './App.css'
import Board from './components/Board'

function App() {
  const [brushColor, setBrushColor] = useState('black');
  const [brushSize, setBrushSize] = useState<number>(5);

  return (
    <div className='App'>
      <h1>Collab Whiteboard</h1>
      <div>
        <Board brushColor={brushColor} brushSize={brushSize}/>
        <div className="tools">
          <div>
            <span>color: </span>
            <input type="color" name="color" value={brushColor} onChange={(e) => setBrushColor(e.target.value)} />
          </div>
          <div>
            <span>size: </span>
            <input type="range" name="size" value={brushSize} onChange={(e) => setBrushSize(Number(e.target.value))} min="1" max="100" />
            <span>{brushSize}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
