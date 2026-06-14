export function scrollToTop(behavior: ScrollBehavior = 'auto') {
  document.getElementById('app-main')?.scrollTo({ top: 0, left: 0, behavior })

  document.querySelectorAll('[data-scroll-root]').forEach((element) => {
    element.scrollTo({ top: 0, left: 0, behavior })
  })
}
