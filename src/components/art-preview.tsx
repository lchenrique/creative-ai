import { Canvas } from "./canvas";
import { FabricCanvas } from "./fabric-canvas";


export function ArtPreview() {


  return (
    <div className="relative w-full h-full">
      <div
        id="art-preview"
        className="w-full h-full bg-transparent relative"
      >

        <div className="absolute inset-0">
          {/* <FabricCanvas /> */}
          <Canvas />
        </div>

      </div>

      {/* Size indicator */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-xs text-muted-foreground bg-background/80 px-3 py-1 rounded-full">
        600 × 600 px
      </div>
    </div>
  )
}
