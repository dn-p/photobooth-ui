export function cn(...classes: string[]) {
  return classes.filter(Boolean).join(' ')
}

export function generatePhotoUrl(index: number, color: string): string {
  return `https://via.placeholder.com/400x400/${color.replace('#', '')}/ffffff?text=Photo+${index + 1}`
}

export function formatDate(date: Date): string {
  return date.toISOString().split('T')[0]
}

export function getRandomColor(): string {
  const colors = [
    '#1e1e2f',
    '#1a1a2e',
    '#16162e',
    '#2d1a1a',
    '#1a2d1a',
    '#1a1a2d',
  ]
  return colors[Math.floor(Math.random() * colors.length)]
}
