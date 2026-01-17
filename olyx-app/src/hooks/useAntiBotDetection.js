import { useState, useEffect, useCallback } from 'react'

export function useAntiBotDetection(onViolation) {
  const [isBot, setIsBot] = useState(false)
  const [detectionDetails, setDetectionDetails] = useState([])

  // Detect headless browsers
  const detectHeadlessBrowser = useCallback(() => {
    const tests = []

    // Check for webdriver
    if (navigator.webdriver) {
      tests.push('webdriver_detected')
    }

    // Check for headless Chrome
    if (
      /HeadlessChrome/.test(navigator.userAgent) ||
      navigator.userAgent.includes('Headless')
    ) {
      tests.push('headless_useragent')
    }

    // Check for missing plugins (common in headless)
    if (navigator.plugins.length === 0) {
      tests.push('no_plugins')
    }

    // Check for Puppeteer/Playwright specific properties
    if (
      window.navigator.webdriver ||
      window.navigator.hasOwnProperty('webdriver') ||
      window.callPhantom ||
      window._phantom ||
      window.phantom
    ) {
      tests.push('automation_tools')
    }

    // Check Chrome specific detection
    if (window.chrome && !window.chrome.runtime) {
      tests.push('chrome_runtime_missing')
    }

    return tests
  }, [])

  // Detect virtual/fake cameras
  const detectVirtualCamera = useCallback(async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices()
      const videoDevices = devices.filter((d) => d.kind === 'videoinput')

      const suspiciousNames = [
        'obs',
        'virtual',
        'fake',
        'snap',
        'manycam',
        'xsplit',
        'loopback',
        'dummy',
        'software',
      ]

      const virtualDevices = videoDevices.filter((device) => {
        const label = device.label.toLowerCase()
        return suspiciousNames.some((name) => label.includes(name))
      })

      return virtualDevices.length > 0
    } catch (err) {
      return false
    }
  }, [])

  // Detect automation patterns (rapid actions)
  let actionTimestamps = []
  const detectAutomationPattern = useCallback((actionType) => {
    const now = Date.now()
    actionTimestamps.push({ type: actionType, timestamp: now })

    // Keep only last minute of actions
    actionTimestamps = actionTimestamps.filter((a) => now - a.timestamp < 60000)

    // If more than 20 actions in 1 minute, likely automated
    if (actionTimestamps.length > 20) {
      return true
    }

    // If same action repeated more than 10 times in 10 seconds
    const recentActions = actionTimestamps.filter(
      (a) => a.type === actionType && now - a.timestamp < 10000
    )
    if (recentActions.length > 10) {
      return true
    }

    return false
  }, [])

  // Run detection on mount
  useEffect(() => {
    const runDetection = async () => {
      const headlessTests = detectHeadlessBrowser()
      const hasVirtualCamera = await detectVirtualCamera()

      const violations = []

      if (headlessTests.length > 0) {
        violations.push({
          type: 'headless_browser',
          details: headlessTests,
        })
      }

      if (hasVirtualCamera) {
        violations.push({
          type: 'virtual_camera',
          details: 'Virtual or fake camera detected',
        })
      }

      if (violations.length > 0) {
        setIsBot(true)
        setDetectionDetails(violations)
        onViolation?.('bot_detected', 'Automated behavior detected', violations)
      }
    }

    runDetection()
  }, [detectHeadlessBrowser, detectVirtualCamera, onViolation])

  return {
    isBot,
    detectionDetails,
    detectAutomationPattern,
  }
}
