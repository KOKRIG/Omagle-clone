import { useEffect, useRef } from 'react'

export default function NativeAd() {
  const containerRef = useRef(null)
  const scriptLoaded = useRef(false)

  useEffect(() => {
    if (scriptLoaded.current) return

    const script = document.createElement('script')
    script.src = 'https://pl28502753.effectivegatecpm.com/99507b6482f10827a9ff00a49258c20e/invoke.js'
    script.async = true
    script.setAttribute('data-cfasync', 'false')

    if (containerRef.current) {
      containerRef.current.appendChild(script)
      scriptLoaded.current = true
    }

    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = ''
      }
    }
  }, [])

  return (
    <div className="native-ad-wrapper">
      <div ref={containerRef}>
        <div id="container-99507b6482f10827a9ff00a49258c20e"></div>
      </div>
    </div>
  )
}
