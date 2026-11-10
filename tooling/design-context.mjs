import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { dirname, join, relative, resolve, isAbsolute, sep } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { createHash } from 'node:crypto'
import MarkdownIt from 'markdown-it'

const packageRoot = fileURLToPath(new URL('../', import.meta.url))
const markdown = new MarkdownIt()
const portable = path => path.split(sep).join('/')
const hash = text => createHash('sha256').update(text).digest('hex')

export function designSections(text) {
  // Plain Markdown treats YAML frontmatter as a setext heading. Mask its
  // characters while retaining line offsets before reading real headings.
  const body = text.replace(/^---\r?\n[\s\S]*?\r?\n---(?:\r?\n|$)/, frontmatter => frontmatter.replace(/[^\r\n]/g, ' '))
  const tokens = markdown.parse(body, {})
  const lines = text.split('\n')
  const headings = tokens.flatMap((token, i) => token.type === 'heading_open' && ['h2', 'h3'].includes(token.tag)
    ? [{ name: tokens[i + 1].content, level: token.tag, start: token.map[0], end: token.map[1] }] : [])
  let section
  return headings.map((heading, i) => {
    if (heading.level === 'h2') section = heading.name
    const nextPeer = headings.slice(i + 1).find(next => next.level <= heading.level)
    return { ...heading, section,
      body: lines.slice(heading.end, headings[i + 1]?.start ?? lines.length).join('\n').trim(),
      subtree: lines.slice(heading.end, nextPeer?.start ?? lines.length).join('\n').trim() }
  })
}

function demoteHeadings(text) {
  const lines = text.split('\n')
  const tokens = markdown.parse(text, {})
  for (const [i, token] of tokens.entries()) {
    if (token.type !== 'heading_open') continue
    const level = Math.min(6, Number(token.tag.slice(1)) + 1)
    lines[token.map[0]] = '#'.repeat(level) + ' ' + tokens[i + 1].content
    for (let line = token.map[0] + 1; line < token.map[1]; line++) lines[line] = ''
  }
  return lines.join('\n')
}

export function rendererDesignRules(text) {
  const sectionNames = { Overview: 'overview', Colors: 'colors', Typography: 'typography', Layout: 'layout', 'Elevation & Depth': 'elevation', Shapes: 'shapes', Components: 'components', "Do's and Don'ts": 'dos-and-donts' }
  return designSections(text).filter(s => s.section !== 'Overview' && s.body).map(s => ({ name: s.name, body: s.body, section: sectionNames[s.section] }))
}

// Only local Markdown links and explicit asset/doc paths are relocated. Tokens,
// fragment-only links, URLs, and ordinary prose retain their original values.
function rebase(text, from, to) {
  const local = path => {
    if (!path || /^(?:[a-z][\w+.-]*:|\/|[?#])/i.test(path)) return path
    const split = path.search(/[?#]/)
    const file = split < 0 ? path : path.slice(0, split)
    const suffix = split < 0 ? '' : path.slice(split)
    const target = portable(relative(to, resolve(from, file)))
    return target + (file.endsWith('/') ? '/' : '') + suffix
  }
  return text.replace(/(\]\()([^\s)]+)(\))/g, (_, start, path, end) => start + local(path) + end)
    .replace(/`((?:assets|docs)\/[^`]+)`/g, (_, path) => '`' + local(path) + '`')
}

function writeFiles(root, files, check) {
  const changed = Object.entries(files).filter(([path, contents]) => !existsSync(join(root, path)) || readFileSync(join(root, path), 'utf8') !== contents)
  if (check && changed.length) throw new Error(`Design context is stale: ${changed.map(([path]) => path).join(', ')}. Run the project's design:sync command.`)
  for (const [path, contents] of changed) {
    mkdirSync(dirname(join(root, path)), { recursive: true })
    writeFileSync(join(root, path), contents)
  }
  return changed.map(([path]) => path)
}

export function syncRendererMetadata({ root = packageRoot, check = false } = {}) {
  const text = readFileSync(join(root, 'DESIGN.md'), 'utf8')
  const data = JSON.parse(readFileSync(join(root, '.impeccable/design.json'), 'utf8'))
  delete data.generatedAt
  data.narrative.rules = rendererDesignRules(text)
  return writeFiles(root, { '.impeccable/design.json': JSON.stringify(data, null, 2) + '\n' }, check)
}

export function courseDesignContext({ courseRoot, policyPath = 'docs/presentation-policy.md', rendererRoot = packageRoot }) {
  courseRoot = resolve(courseRoot)
  const policyFile = resolve(courseRoot, policyPath)
  const policyRelative = relative(courseRoot, policyFile)
  if (policyRelative === '..' || policyRelative.startsWith(`..${sep}`) || isAbsolute(policyRelative)) throw new Error('Course policy must be inside the course root.')
  const source = readFileSync(join(rendererRoot, 'DESIGN.md'), 'utf8')
  const policy = readFileSync(policyFile, 'utf8')
  const pkg = JSON.parse(readFileSync(join(rendererRoot, 'package.json'), 'utf8'))
  const metadataText = readFileSync(join(rendererRoot, '.impeccable/design.json'), 'utf8')
  const data = JSON.parse(metadataText)
  const sourcePath = portable(relative(courseRoot, rendererRoot))
  const policyName = portable(policyRelative)
  const banner = `<!-- GENERATED by slidev-addon-renderer. Do not edit this file.\nSources: ${sourcePath}/DESIGN.md and ${policyName}.\nRefresh: npm run design:sync; verify: npm run design:check. -->`
  let document = rebase(source, rendererRoot, courseRoot)
  const boundary = document.indexOf('\n## Colors\n')
  if (!document.startsWith('---\n') || boundary < 0) throw new Error('Renderer design must supply token frontmatter and a Colors section.')
  const courseSections = designSections(policy).filter(s => s.level === 'h2')
  const policyIntro = policy.split('\n').slice(0, courseSections[0]?.start).join('\n').replace(/^# [^\n]*\n*/, '').trim()
  const policyText = body => rebase(body, dirname(policyFile), courseRoot)
  const policyBody = [policyText(policyIntro), ...courseSections.map(s => `### ${s.name}\n\n${policyText(demoteHeadings(s.subtree))}`)].filter(Boolean).join('\n\n')
  document = document.slice(0, boundary) + `\n${banner}\n\nCourse policy below is generated from [${policyName}](${policyName}); the shared visual system comes from pinned renderer ${pkg.version}.\n\n${policyBody}\n` + document.slice(boundary)
  data.components = data.components.map(component => ({ ...component }))
  data.narrative.rules = data.narrative.rules.map(rule => ({ ...rule, body: rebase(rule.body, rendererRoot, courseRoot) }))
  if (policyIntro) data.narrative.rules.push({ name: 'Course policy', body: policyText(policyIntro), section: 'overview' })
  data.narrative.rules.push(...courseSections.map(s => ({ name: s.name, body: policyText(s.subtree), section: 'overview' })))
  data.generatedFrom = {
    renderer: { package: pkg.name, version: pkg.version, designSha256: hash(source), metadataSha256: hash(metadataText) },
    policy: { path: policyName, sha256: hash(policy) },
  }
  return { 'DESIGN.md': document, '.impeccable/design.json': JSON.stringify(data, null, 2) + '\n' }
}

export function syncCourseDesignContext(options) {
  return writeFiles(options.courseRoot, courseDesignContext(options), options.check ?? false)
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const check = process.argv.includes('--check')
  const changed = syncRendererMetadata({ check })
  console.log(check ? 'Renderer design metadata is current.' : `Renderer design metadata refreshed (${changed.length} file changed).`)
}
