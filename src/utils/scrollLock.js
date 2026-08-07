let lockCount = 0
let saved = null

export function lockPageScroll() {
  if (lockCount++ > 0) return
  saved = {
    htmlOverflow: document.documentElement.style.overflow,
    bodyOverflow: document.body.style.overflow,
  }
  document.documentElement.style.overflow = 'hidden'
  document.body.style.overflow = 'hidden'
}

export function unlockPageScroll() {
  if (lockCount <= 0) return
  if (--lockCount > 0) return
  if (!saved) return
  document.documentElement.style.overflow = saved.htmlOverflow
  document.body.style.overflow = saved.bodyOverflow
  saved = null
}

export function forceUnlockPageScroll() {
  lockCount = 0
  if (!saved) return
  document.documentElement.style.overflow = saved.htmlOverflow
  document.body.style.overflow = saved.bodyOverflow
  saved = null
}
