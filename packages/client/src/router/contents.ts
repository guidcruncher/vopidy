import * as browseRadioBrowser from '@/pages/browse-radiobrowser.vue'
import * as browseSpotify from '@/pages/browse-spotify.vue'
import * as browseTunein from '@/pages/browse-tunein.vue'
import * as discover from '@/pages/discover.vue'
import * as index from '@/pages/index.vue'
import * as library from '@/pages/library.vue'
import * as mixerdesk from '@/pages/mixerdesk.vue'
import * as nowplaying from '@/pages/nowplaying.vue'
import * as queue from '@/pages/queue.vue'
import * as search from '@/pages/search.vue'
import * as streams from '@/pages/streams.vue'

export const contents = [
  {
    title: 'Welcome',
    prependIcon: 'mdi-home-variant-outline',
    to: '/',
    component: index,
    link: true,
  },
  {
    title: 'Now Playing',
    prependIcon: 'mdi-speaker',
    to: 'nowplaying',
    component: nowplaying,
    link: true,
  },
  {
    title: 'Mixer Desk',
    prependIcon: 'mdi-tune-vertical',
    to: 'mixerdesk',
    component: mixerdesk,
    link: true,
  },
  {
    title: 'Queue',
    prependIcon: 'mdi-queue-first-in-last-out',
    to: 'queue',
    component: queue,
    link: true,
  },
  {
    title: 'Discover',
    prependIcon: 'mdi-eye-circle-outline',
    to: 'discover',
    component: discover,
    link: true,
  },
  {
    title: 'Tunein Browse',
    prependIcon: 'mdi-view-list',
    to: 'browse-tunein',
    component: browseTunein,
    link: true,
  },
  {
    title: 'Spotify Browse',
    prependIcon: 'mdi-view-list',
    to: 'browse-spotify',
    component: browseSpotify,
    link: true,
  },
  {
    title: 'Radiobrowser Browse',
    prependIcon: 'mdi-view-list',
    to: 'browse-radiobrowser',
    component: browseRadioBrowser,
    link: true,
  },
  {
    title: 'Streams',
    prependIcon: 'mdi-cast-audio',
    to: 'streams',
    component: streams,
    link: true,
  },
  {
    title: 'Library',
    prependIcon: 'mdi-folder-music-outline',
    to: 'library',
    component: library,
    link: true,
  },
  {
    title: 'Search',
    prependIcon: 'mdi-magnify ',
    to: 'search',
    component: search,
    link: true,
  },
]

export const contentsCatalog = () => {
  const res = []
  for (const item of contents) {
    res.push({ title: item.title, prependIcon: item.prependIcon, to: item.to, link: item.link })
  }

  return res
}
