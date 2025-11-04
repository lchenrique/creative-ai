import { Background } from "./art-background";
import { FabricCanvas } from "./fabric-canvas";


export function ArtPreview() {


  return (
    <div className="relative">
      <div
        id="art-preview"
        className={`w-[600px] h-[750px] bg-transparent rounded-2xl shadow-2xl overflow-hidden relative `}
      >

        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-8">
          <FabricCanvas />
        </div>

      </div>

      {/* Size indicator */}
      <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-xs text-muted-foreground">600 × 600 px</div>
    </div>
  )
}
