import { useEffect, useRef } from 'react'

export default function BannerAd() {
  const containerRef = useRef(null)
  const scriptLoaded = useRef(false)

  useEffect(() => {
    if (scriptLoaded.current) return

    const script1 = document.createElement('script')
    script1.innerHTML = `
      atOptions = {
        'key' : '35c8a2602d31560676ad1988b16f8136',
        'format' : 'iframe',
        'height' : 60,
        'width' : 468,
        'params' : {}
      };
    `

    const script2 = document.createElement('script')
    script2.src = 'https://www.highperformanceformat.com/35c8a2602d31560676ad1988b16f8136/invoke.js'
    script2.async = true

    if (containerRef.current) {
      containerRef.current.appendChild(script1)
      containerRef.current.appendChild(script2)
      scriptLoaded.current = true
    }

    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = ''
      }
    }
  }, [])

  return (
    <div className="banner-ad-container">
      <div ref={containerRef} className="banner-ad-content"></div>
    </div>
  )
}
