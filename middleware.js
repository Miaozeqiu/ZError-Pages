export function middleware({ request, next, redirect }) {
  const url = new URL(request.url)
  if (url.hostname !== 'app.zerror.cc') return next()

  return redirect(`https://app.zerrorai.com${url.pathname}${url.search}`, 301)
}
