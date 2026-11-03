import { useId } from 'react'

// Four-point spark used for the logo and AI accents.
const SPARK_PATH =
  'M12 1.5C12.8 7.6 16.4 11.2 22.5 12 16.4 12.8 12.8 16.4 12 22.5 11.2 16.4 7.6 12.8 1.5 12 7.6 11.2 11.2 7.6 12 1.5Z'

// Each point of the spark gets one Google accent colour (clockwise from the top).
const QUADRANTS = [
  { points: '0,0 24,0 12,12', color: 'var(--blue)' },
  { points: '24,0 24,24 12,12', color: 'var(--red)' },
  { points: '24,24 0,24 12,12', color: 'var(--yellow)' },
  { points: '0,24 0,0 12,12', color: 'var(--green)' },
]

/** The app logo: a four-colour spark. Decorative — pair it with the product name. */
export function LogoMark({ size = 28 }: { size?: number }) {
  const id = useId()
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" focusable="false" className="logo-mark">
      <defs>
        {QUADRANTS.map((quadrant, index) => (
          <clipPath key={quadrant.points} id={`${id}-q${index}`}>
            <polygon points={quadrant.points} />
          </clipPath>
        ))}
      </defs>
      {QUADRANTS.map((quadrant, index) => (
        <path key={quadrant.points} d={SPARK_PATH} fill={quadrant.color} clipPath={`url(#${id}-q${index})`} />
      ))}
    </svg>
  )
}

/** Filled AI spark with a blue-to-purple gradient, used to mark AI-generated content. */
export function AiSpark({ size = 16 }: { size?: number }) {
  const id = useId()
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" focusable="false" className="ai-spark">
      <defs>
        <linearGradient id={`${id}-g`} x1="3" y1="21" x2="21" y2="3" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="var(--blue)" />
          <stop offset="1" stopColor="var(--accent)" />
        </linearGradient>
      </defs>
      <path d={SPARK_PATH} fill={`url(#${id}-g)`} />
    </svg>
  )
}
