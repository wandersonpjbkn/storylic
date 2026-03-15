import type { UseSeoMetaInput } from '@unhead/vue'
import { useSeoMeta } from '@unhead/vue'

import seoData from '@/data/seo.json'

const baseSeo = seoData as unknown as UseSeoMetaInput

export const useSeo = (overrides?: Partial<UseSeoMetaInput>) => {
  useSeoMeta({
    ...baseSeo,
    ...overrides,
  })
}
