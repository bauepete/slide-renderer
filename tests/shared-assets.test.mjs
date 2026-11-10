import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync, mkdirSync, rmSync, writeFileSync, realpathSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
import { resolveSharedAssetRequest, serveSharedAssets } from '../utils/shared-assets.mjs'

function fixture(t) {
  const root = realpathSync(mkdtempSync(join(tmpdir(), 'course-shared-assets-')))
  t.after(() => rmSync(root, { recursive: true, force: true }))
  for (const name of ['Exercise', 'StartingPointAndMotivation']) mkdirSync(join(root, name))
  writeFileSync(join(root, 'Exercise/exercise-draft.jpg'), 'exercise')
  writeFileSync(join(root, 'StartingPointAndMotivation/starting point.png'), 'motivation')
  return root
}

test('normalized shared-image URLs resolve to their original files with queries intact', t => {
  const root = fixture(t)
  assert.equal(resolveSharedAssetRequest('/Assets/Exercise/exercise-draft.jpg?inline&t=123', root), `/@fs${pathToFileURL(join(root, 'Exercise/exercise-draft.jpg')).pathname}?inline&t=123`)
  assert.equal(resolveSharedAssetRequest('/Assets/StartingPointAndMotivation/starting%20point.png', root), `/@fs${pathToFileURL(join(root, 'StartingPointAndMotivation/starting point.png')).pathname}`)
  assert.equal(serveSharedAssets(root).apply, 'serve')
  assert.equal(resolveSharedAssetRequest('/Illustrations/Exercise/exercise-draft.jpg', root, '/Illustrations/'), `/@fs${pathToFileURL(join(root, 'Exercise/exercise-draft.jpg')).pathname}`)
})

test('deck-local images, missing files, directories, and paths outside shared Assets are untouched', t => {
  const root = fixture(t)
  for (const url of ['/assets/local.png', '/@fs/other.png', '/Assets/missing.png', '/Assets/Exercise/', '/Assets/../outside.png', '/Assets/%2e%2e/outside.png', '/Assets/%2Foutside.png', '/Assets/%invalid']) {
    assert.equal(resolveSharedAssetRequest(url, root), null, url)
  }
})
