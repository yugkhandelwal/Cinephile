import { ReactLenis } from 'lenis/react'
import { ReactNode } from 'react'

interface SmoothScrollProviderProps {
  children: ReactNode;
}

export function SmoothScrollProvider({ children }: SmoothScrollProviderProps) {
  return (
    <ReactLenis 
      root 
      options={{
        lerp: 0.1, // Adjusts the interpolation (smoothness)
        duration: 1.5,
        smoothWheel: true,
      }}
    >
      {children}
    </ReactLenis>
  )
}
