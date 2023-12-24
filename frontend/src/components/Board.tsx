import {useEffect, useRef, useState} from 'react'
import io from 'socket.io-client';

interface MyBoard {
  brushColor: string;
  brushSize: number;
}

const Board: React.FC<MyBoard> = ({brushColor, brushSize}) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [socket, setSocket] = useState<any>(null);
  const [windowSize, setWindowSize] = useState([
    window.innerWidth,
    window.innerHeight
  ])
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const newSocket = io('http://localhost:5000');
    console.log(newSocket, "Connected to socket");
    setSocket(newSocket);
  },[])

  useEffect(()=> {
    if(socket) {
      socket.on('canvasImage', (data: string) => {
        // create an image object from the data url
        const image = new Image();
        image.src = data;

        const canvas = canvasRef.current;
         // eslint-disable-next-line react-hooks/exhaustive-deps
        const ctx = canvas?.getContext('2d');
        // Draw the image on to the canvas
        image.onload = () => {
          ctx?.drawImage(image, 0, 0);
        }
      })
    }
  },[socket]);

  useEffect(() => {

    // Varibles to store drawing state
    let isDrawing = false;
    let lastX = 0;
    let lastY = 0;

    const startDrawing = (e: {offsetX: number; offsetY: number;}) => {
      isDrawing = true;

      console.log("drawing started", brushColor, brushSize);
      [lastX, lastY] = [e.offsetX, e.offsetY];
    }

    // func to draw
    const draw = (e: {offsetX:number; offsetY: number;}) => {
      if(!isDrawing) return;

      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if(ctx) {
        ctx.beginPath();
        ctx.moveTo(lastX, lastY);
        ctx.lineTo(e.offsetX, e.offsetY);
        ctx.stroke();
      }

      [lastX, lastY] = [e.offsetX, e.offsetY];
    }

    // func to end drawing
    const endDrawing = () =>{
      const canvas = canvasRef.current;
      const dataUrl = canvas?.toDataURL(); //get the data url of the canvas context

      // send the dataUrl or image data to the socket
      // console.log('drawing ended');

      if (socket) {
        socket.emit('canvasImage', dataUrl);
        console.log('drawing ended');
      }
      isDrawing = false;
    }

    const canvas: HTMLCanvasElement | null = canvasRef.current;
    const ctx = canvasRef.current?.getContext('2d');

    // set init drawing styles
    if(ctx) {
      ctx.strokeStyle = brushColor;
      ctx.lineWidth = brushSize;

      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
    }

    // event listeners for drawing
    canvas?.addEventListener('mousedown', startDrawing);
    canvas?.addEventListener('mousemove', draw);
    canvas?.addEventListener('mouseup', endDrawing);
    canvas?.addEventListener('mouseout', endDrawing);

    return () => {
      // clean up event listeners when component unmounts
      canvas?.removeEventListener('mousedown', startDrawing);
      canvas?.removeEventListener('mousemove', draw);
      canvas?.removeEventListener('mouseup', endDrawing);
      canvas?.removeEventListener('mouseout', endDrawing);
    }
  },[brushColor, brushSize, socket])

  useEffect(() => {
    const handleWindowSize = () => {
      setWindowSize([window.innerWidth, window.innerHeight]);
    }

    window.addEventListener('resize', handleWindowSize);

    return () => {
      window.removeEventListener('resize', handleWindowSize);
    }
  },[])

  return (
    <canvas
      ref={canvasRef}
      width={windowSize[0] > 600 ? 600 : 300}
      height={windowSize[1] > 400 ? 400 : 200}
      style={{backgroundColor: 'white'}}
    />
  )
}

export default Board