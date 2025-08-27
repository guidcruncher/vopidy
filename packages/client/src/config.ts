export const config = {
  apiBaseUrl: () => {
    return `${window.location.protocol}//${window.location.host}/api`
  },
  wsBaseUrl: () => {
    if (window.location.protocol == 'https') {
      return `wss://${window.location.host}/api/ws`
    }
    return `ws://${window.location.host}/api/ws`
  },
}
