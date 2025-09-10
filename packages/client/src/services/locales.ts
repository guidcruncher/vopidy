export function getLocale(): string {
  const intl = window.Intl
  if (intl !== undefined) {
    return intl.NumberFormat().resolvedOptions().locale
  }

  const languages = navigator.languages as string[] | undefined
  if (languages !== undefined && languages.length > 0) {
    return languages[0]
  }

  return navigator.language ?? 'en-US'
}

export function getTimezone(): string {
  const intl = window.Intl
  if (intl !== undefined) {
    return intl.DateTimeFormat().resolvedOptions().timeZone
  }

  return 'Europe/London'
}
