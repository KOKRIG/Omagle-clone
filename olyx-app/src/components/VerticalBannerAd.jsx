import { useEffect, useRef } from 'react'

export default function VerticalBannerAd() {
  const containerRef = useRef(null)
  const scriptLoaded = useRef(false)

  useEffect(() => {
    if (scriptLoaded.current) return

    const script1 = document.createElement('script')
    script1.innerHTML = `
      atOptions = {
        'key' : 'afba01175d1eb6806dc2f07172fc94a6',
        'format' : 'iframe',
        'height' : 600,
        'width' : 160,
        'params' : {}
      };
    `

    const script2 = document.createElement('script')
    script2.src = 'https://www.highperformanceformat.com/afba01175d1eb6806dc2f07172fc94a6/invoke.js'
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
    <div className="vertical-banner-ad-container">
      <div ref={containerRef} className="vertical-banner-ad-content"></div>
    </div>
  )
}
