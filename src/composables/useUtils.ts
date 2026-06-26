import type { Card } from '@/types'

export const normalizeString = (name: string): string =>
  name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '_')

export const shuffleArray = (array: Card[]): Card[] => {
  const newArray = [...array]
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    const temp = newArray[i]

    if (newArray[j]) newArray[i] = newArray[j]
    if (temp) newArray[j] = temp
  }
  return newArray
}
