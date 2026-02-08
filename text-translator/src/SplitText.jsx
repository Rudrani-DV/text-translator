import { useEffect, useMemo, useRef, useState } from 'react'

function normalizeWhitespace(text) {
  return text.replace(/\s+/g, ' ')
}

function toUnits(text, splitType) {
  const normalized = normalizeWhitespace(text)
  if (splitType.includes('words')) {
    return normalized.split(' ').map((w, i, arr) => (i < arr.length - 1 ? `${w} ` : w))
  }
  return Array.from(text)
}

export default function SplitText({
  text,
  className = '',
  delay = 100,
  duration = 0.6,
  ease = 'power3.out',
  splitType = 'chars',
  from = { opacity: 0, y: 40 },
  to = { opacity: 1, y: 0 },
  threshold = 0.1,
  rootMargin = '-100px',
  textAlign = 'center',
  tag = 'p',
  onLetterAnimationComplete,
}) {
  const ref = useRef(null)
  const animationCompletedRef = useRef(false)
  const onCompleteRef = useRef(onLetterAnimationComplete)
  const [fontsLoaded, setFontsLoaded] = useState(() => {
    if (typeof document === 'undefined') return false
    if (!document.fonts) return true
    return document.fonts.status === 'loaded'
  })
  const [started, setStarted] = useState(false)

  useEffect(() => {
    onCompleteRef.current = onLetterAnimationComplete
  }, [onLetterAnimationComplete])

  useEffect(() => {
    if (fontsLoaded) return
    if (typeof document === 'undefined') return
    if (!document.fonts) return

    let cancelled = false
    document.fonts.ready
      .then(() => {
        if (!cancelled) setFontsLoaded(true)
      })
      .catch(() => {
        if (!cancelled) setFontsLoaded(true)
      })

    return () => {
      cancelled = true
    }
  }, [fontsLoaded])

  const units = useMemo(() => {
    if (!text) return []
    return toUnits(text, splitType)
  }, [text, splitType])

  useEffect(() => {
    if (!ref.current || !text || !fontsLoaded) return
    if (animationCompletedRef.current) return

    const el = ref.current
    let startTimerId
    const scheduleStart = () => {
      startTimerId = window.setTimeout(() => setStarted(true), 0)
    }

    if (typeof IntersectionObserver === 'undefined') {
      scheduleStart()
      return () => {
        if (startTimerId) window.clearTimeout(startTimerId)
      }
    }

    const rect = el.getBoundingClientRect()
    const inView = rect.top < window.innerHeight && rect.bottom > 0
    if (inView) {
      scheduleStart()
      return () => {
        if (startTimerId) window.clearTimeout(startTimerId)
      }
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setStarted(true)
          observer.disconnect()
        }
      },
      { threshold, rootMargin },
    )

    observer.observe(el)
    return () => {
      if (startTimerId) window.clearTimeout(startTimerId)
      observer.disconnect()
    }
  }, [text, fontsLoaded, threshold, rootMargin])

  useEffect(() => {
    if (!started || !text) return
    if (animationCompletedRef.current) return

    const totalMs = Math.max(0, (units.length - 1) * delay + duration * 1000)
    const timer = window.setTimeout(() => {
      animationCompletedRef.current = true
      onCompleteRef.current?.()
    }, totalMs)
    return () => window.clearTimeout(timer)
  }, [started, text, units.length, delay, duration])

  const style = { textAlign, wordWrap: 'break-word' }
  const classes = `overflow-hidden whitespace-normal ${className}`.trim()
  const Tag = tag

  const timingFunction =
    ease === 'power3.out' ? 'cubic-bezier(0.16, 1, 0.3, 1)' : 'ease-out'

  const fromOpacity = typeof from?.opacity === 'number' ? from.opacity : 0
  const toOpacity = typeof to?.opacity === 'number' ? to.opacity : 1
  const fromY = typeof from?.y === 'number' ? from.y : 0
  const toY = typeof to?.y === 'number' ? to.y : 0

  return (
    <Tag ref={ref} style={style} className={classes}>
      {units.map((unit, idx) => (
        <span
          key={`${unit}-${idx}`}
          data-split-unit="true"
          className="inline-block will-change-transform"
          style={{
            opacity: started ? toOpacity : fromOpacity,
            transform: `translate3d(0, ${started ? toY : fromY}px, 0)`,
            transitionProperty: 'opacity, transform',
            transitionDuration: `${duration}s`,
            transitionTimingFunction: timingFunction,
            transitionDelay: `${idx * delay}ms`,
          }}
        >
          {unit === ' ' ? '\u00A0' : unit}
        </span>
      ))}
    </Tag>
  )
}
