import { TabsContent } from "@radix-ui/react-tabs"
import { GradientPreview, type GradientPreviewProps } from "../@new/canvas/gradient-preview"

export interface GradientTabProps extends GradientPreviewProps { }

export const GradientTab = ({ value, onChange }: GradientTabProps) => {

  return <TabsContent value="gradient" className="mt-4 outline-none overflow-hidden">
    <GradientPreview
      value={value}
      onChange={onChange}
    />
  </TabsContent>
}