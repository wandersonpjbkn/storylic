/**
 * Retorna o caminho da imagem da CATEGORIA.
 * Todos os cards de uma mesma categoria compartilham a mesma imagem.
 * Ex: 'animals' → '/cards/animals.png'
 */
export const categoryImagePath = (category: string): string => `/cards/${category}.png`

// Mantido para compatibilidade caso seja usado em outro lugar
export const normalizeCardName = (name: string): string =>
  name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '_')
