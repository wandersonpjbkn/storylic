/**
 * Retorna o caminho da imagem da CATEGORIA.
 * Todos os cards de uma mesma categoria compartilham a mesma imagem.
 *
 * As imagens devem estar em: /public/cards/{category}.png
 * Ex: /public/cards/animals.png, /public/cards/nature.png, etc.
 *
 * Categorias disponíveis: actions | animals | emotions | nature | objects | personas | places
 */
export const categoryImagePath = (category: string): string => `/cards/${category}.png`

/**
 * Normaliza o nome do card para uso em URLs/paths.
 * "Emoções" → "emocoes" | "Arco-íris" → "arco-iris"
 * Mantido para compatibilidade, não é usado pelos cards atualmente.
 */
export const normalizeCardName = (name: string): string =>
  name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '_')
