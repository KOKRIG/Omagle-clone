import { useEffect, useRef } from 'react'

export default function InterstitialAd() {
  const containerRef = useRef(null)
  const scriptLoaded = useRef(false)

  useEffect(() => {
    if (scriptLoaded.current) return

    const script = document.createElement('script')
    script.async = true
    script.setAttribute('data-cfasync', 'false')
    script.src = 'https://pl28502753.effectivegatecpm.com/99507b6482f10827a9ff00a49258c20e/invoke.js'

    const container = document.createElement('div')
    container.id = 'container-99507b6482f10827a9ff00a49258c20e'

    if (containerRef.current) {
      containerRef.current.appendChild(script)
      containerRef.current.appendChild(container)
      scriptLoaded.current = true
    }

    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = ''
      }
    }
  }, [])

  return (
    <div className="interstitial-ad-container" style={{ minHeight: '250px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <div ref={containerRef}></div>
    </div>
  )
}
