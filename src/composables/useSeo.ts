import { useSeoMeta } from '@unhead/vue'

import seoData from '@/data/seo.json'

export const useSeo = (overrides?: any) => {
  useSeoMeta({
    ...seoData,
    ...overrides,
  })
}
