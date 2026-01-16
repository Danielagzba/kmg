const VISITOR_ID_KEY = 'fmk-visitor-id'

export function getVisitorId(): string {
  if (typeof window === 'undefined') return ''

  let visitorId = localStorage.getItem(VISITOR_ID_KEY)

  if (!visitorId) {
    visitorId = 'v_' + Math.random().toString(36).substring(2) + Date.now().toString(36)
    localStorage.setItem(VISITOR_ID_KEY, visitorId)
  }

  return visitorId
}
