// internal
import { useHead } from '@unhead/vue'

import { useThemeStore } from '@/stores/theme'

import type { Metadata } from './type'

const { theme } = useThemeStore()

export const meta = (data: Metadata) => {
  const config = {
    TITLE: 'ADMIN',
    SUFFIX: theme?.business!.name || 'Prata Digital',
    DESCRIPTION: '',
    HOST: window.location.host,
    HOSTNAME: `${window.location.protocol}${window.location.host}${window.location.pathname}`,
    IMAGE: `${window.location.protocol}${window.location.host}${'/img/home-page.jpg'}`,
  }

  // title
  const base = {
    title: (data.title ?? config.TITLE).trim(),
    titleTemplate: `%s${config.SUFFIX}`.trim(),
  }

  // default
  const description = {
    name: 'description',
    content: (data.description ?? config.DESCRIPTION).trim(),
  }

  // open-graph (most widely used)
  const openGraph = [
    { property: 'og:title', content: `${base.title}${config.SUFFIX}` },
    { property: 'og:site_name', content: config.HOST },
    { property: 'og:type', content: 'website' },
    { property: 'og:url', content: config.HOSTNAME },
    { property: 'og:image', content: `${config.IMAGE}` },
    { property: 'og:description', content: data.description },
  ]

  // twitter card
  const twitter = [
    { name: 'twitter:card', content: 'summary' },
    { name: 'twitter:site', content: config.HOST },
    { name: 'twitter:title', content: `${base.title}${config.SUFFIX}` },
    { name: 'twitter:description', content: data.description },
  ]

  // google/schema.org markup
  const google = [
    { itemprop: 'name', content: `${base.title}${config.SUFFIX}` },
    { itemprop: 'description', content: data.description },
    { itemprop: 'image', content: `${config.IMAGE}` },
  ]

  /** Metadata */
  const metadata = {
    ...base,
    meta: [description, ...openGraph, ...twitter, ...google],
  }

  // noindex validation
  if (data.noindex) {
    metadata.meta.push({
      name: 'robots',
      content: 'noindex, nofollow, noarchive, nosnippet, noodp',
    })
  }

  // set data
  useHead(metadata)
}
