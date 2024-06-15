import { useEffect, useState } from "react";
import { Stage } from "@pixi/react";
import { PixiApp } from "./components/PixiApp";

function App() {
  const [stageSize, setStageSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    setStageSize({
      width: window.innerWidth,
      height: window.innerHeight,
    });
  }, []);
  return (
    <Stage {...stageSize}>
      <PixiApp />
    </Stage>
  );
}

export default App;
