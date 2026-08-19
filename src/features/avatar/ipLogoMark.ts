const fnv1a = (value: string) => {
  let hash = 2166136261
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index)
    hash = Math.imul(hash, 16777619)
  }
  return hash >>> 0
}

const unit = (hash: number, shift: number) => ((hash >>> shift) & 255) / 255

const backgrounds = ['#C9785A', '#6F8F72', '#5D6FA6', '#8A6B8A', '#C4A15A', '#3D4A63']
const ipColors = ['#E8D9C4', '#2C2A28', '#F2E6D4', '#1F2430', '#D9C4A8', '#3A332C']
const accentColors = ['#2C2A28', '#E8D9C4', '#1F2430', '#F2E6D4', '#3A332C', '#D9C4A8']

export const sanitizeImportedSvg = (source: string) => {
  const svg = source
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<foreignObject[\s\S]*?<\/foreignObject>/gi, '')
    .replace(/\son[a-zA-Z]+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/g, '')
  if (!/<svg[\s>]/i.test(svg)) {
    throw new Error('The imported file is not a square SVG mark.')
  }
  return svg
}

export const wrapRasterMark = (dataUrl: string) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100" role="img"><image href="${dataUrl.replace(/"/g, '')}" width="100" height="100" preserveAspectRatio="xMidYMid slice"/></svg>`

export const generateIpLogoSvg = (seed: string) => {
  const hash = fnv1a(seed || 'ip-logo')
  const background = backgrounds[hash % backgrounds.length]
  const fill = ipColors[(hash >>> 5) % ipColors.length]
  const accent = accentColors[(hash >>> 9) % accentColors.length]
  const fromLeft = unit(hash, 12) > 0.5
  const visor = unit(hash, 16) > 0.55
  const id = `ip-${hash.toString(16)}`
  const headCx = fromLeft ? 38 : 62
  const earDx = fromLeft ? -22 : 22
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100" role="img" aria-label="${seed.replace(/[<>&"]/g, '')}">
  <defs>
    <linearGradient id="${id}-volume" x1="18%" y1="12%" x2="86%" y2="88%">
      <stop offset="0" stop-color="${fill}" stop-opacity="1"/>
      <stop offset="1" stop-color="${fill}" stop-opacity="0.86"/>
    </linearGradient>
  </defs>
  <rect width="100" height="100" fill="${background}"/>
  <ellipse cx="${headCx + earDx}" cy="46" rx="14" ry="18" fill="url(#${id}-volume)"/>
  <ellipse cx="${headCx - earDx}" cy="46" rx="14" ry="18" fill="url(#${id}-volume)"/>
  <ellipse cx="${headCx}" cy="62" rx="34" ry="38" fill="url(#${id}-volume)"/>
  ${
    visor
      ? `<path d="M${headCx - 22} 54 C ${headCx - 18} 42, ${headCx + 18} 42, ${headCx + 22} 54 L ${headCx + 18} 62 Q ${headCx} 58 ${headCx - 18} 62 Z" fill="${accent}"/>`
      : `<ellipse cx="${headCx}" cy="58" rx="20" ry="16" fill="${accent}"/>`
  }
  <ellipse cx="${headCx - 8}" cy="60" rx="3.4" ry="4.2" fill="${fill}"/>
  <ellipse cx="${headCx + 8}" cy="60" rx="3.4" ry="4.2" fill="${fill}"/>
  <path d="M${headCx - 6} 70 Q ${headCx} 74 ${headCx + 6} 70" fill="none" stroke="${fill}" stroke-width="2.4" stroke-linecap="round"/>
</svg>`
}

export const readSquareMarkFile = async (file: File) => {
  if (file.type === 'image/svg+xml' || file.name.toLowerCase().endsWith('.svg')) {
    return sanitizeImportedSvg(await file.text())
  }
  if (!file.type.startsWith('image/')) {
    throw new Error('Import a square SVG or raster image.')
  }
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === 'string') resolve(reader.result)
      else reject(new Error('The imported image could not be read.'))
    }
    reader.onerror = () => reject(new Error('The imported image could not be read.'))
    reader.readAsDataURL(file)
  })
  return wrapRasterMark(dataUrl)
}
