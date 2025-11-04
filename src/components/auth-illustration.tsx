import illustrationImage from "@/assets/ill.png"

export function AuthIllustration() {
  return (
    <div className="relative w-full h-full flex items-center justify-center p-8">
      <img
        src={illustrationImage}
        alt="Creative AI Platform - Design and Marketing Automation"
        className="w-full h-auto max-w-2xl object-contain"
      />
    </div>
  )
}
