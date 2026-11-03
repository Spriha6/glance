const TONES = [
  { background: 'var(--accent-soft)', color: 'var(--accent-ink)' },
  { background: 'var(--blue-soft)', color: 'var(--blue-ink)' },
  { background: 'var(--green-soft)', color: 'var(--green-ink)' },
  { background: 'var(--yellow-soft)', color: 'var(--yellow-ink)' },
  { background: 'var(--red-soft)', color: 'var(--red-ink)' },
]

function toneFor(name: string) {
  let hash = 0
  for (const char of name) hash = (hash * 31 + char.charCodeAt(0)) >>> 0
  return TONES[hash % TONES.length]
}

function initialsFor(name: string) {
  const words = name.replace(/[^\p{L}\s]/gu, '').split(/\s+/).filter(Boolean)
  return words
    .slice(0, 2)
    .map((word) => word[0].toUpperCase())
    .join('')
}

interface AvatarProps {
  name: string
  size?: 'sm' | 'md' | 'lg'
}

export function Avatar({ name, size = 'md' }: AvatarProps) {
  return (
    <span className={`avatar avatar--${size}`} style={toneFor(name)} aria-hidden="true">
      {initialsFor(name)}
    </span>
  )
}
