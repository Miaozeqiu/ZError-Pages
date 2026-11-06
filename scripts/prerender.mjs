import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import { join, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { build } from 'vite'

const dist = resolve('dist')
const temp = await mkdtemp(resolve('.prerender-'))
const escape = (value) => value.replace(/[&<>"']/g, (char) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
})[char])

try {
  await build({
    publicDir: false,
    build: { ssr: 'src/entry-prerender.ts', outDir: temp },
  })
  const { getPageSeo, publicPaths, render, siteOrigin } = await import(
    pathToFileURL(join(temp, 'entry-prerender.js')).href
  )
  const shell = await readFile(join(dist, 'index.html'), 'utf8')
  for (const path of publicPaths) {
    const page = getPageSeo(path)
    const markup = await render(path)
    const html = shell
      .replace(/<title>[^<]*<\/title>/, () => `<title>${escape(page.title)}</title>`)
      .replace(/(<meta name="description" content=")[^"]*/, (_, tag) => tag + escape(page.description))
      .replace(/(<meta property="og:title" content=")[^"]*/, (_, tag) => tag + escape(page.title))
      .replace(/(<meta property="og:description" content=")[^"]*/, (_, tag) => tag + escape(page.description))
      .replace(/(<meta property="og:url" content=")[^"]*/, (_, tag) => tag + escape(page.url))
      .replace('</head>', () => `<link rel="canonical" href="${escape(page.url)}">\n</head>`)
      .replace('<div id="app"></div>', () => `<div id="app" data-prerendered="${path}">${markup}</div>`)
    const folder = join(dist, path)
    await mkdir(folder, { recursive: true })
    await writeFile(join(folder, 'index.html'), html)
  }

  const urls = publicPaths.map((path) => `  <url><loc>${escape(getPageSeo(path).url)}</loc></url>`)
  await writeFile(join(dist, 'sitemap.xml'), [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...urls,
    '</urlset>',
    '',
  ].join('\n'))
  await writeFile(join(dist, 'robots.txt'), `User-agent: *\nDisallow:\nSitemap: ${siteOrigin}/sitemap.xml\n`)
} finally {
  await rm(temp, { recursive: true, force: true })
}
