import { useState, useEffect } from 'react'

interface WindowDimensions {
  width: number
  height: number
  isMobile: boolean
}

const useWindowDimensions = (): WindowDimensions => {
  const [windowDimensions, setWindowDimensions] = useState<WindowDimensions>(() => {
    const width = window.innerWidth
    const height = window.innerHeight
    return {
      width,
      height,
      isMobile: width < 768
    }
  })

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth
      const height = window.innerHeight
      setWindowDimensions({
        width,
        height,
        isMobile: width < 768
      })
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return windowDimensions
}

export default useWindowDimensions
