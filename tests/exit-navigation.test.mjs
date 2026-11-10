import test from 'node:test'
import assert from 'node:assert/strict'
import { episodeOverviewUrl } from '../utils/exit-navigation.mjs'
import { site } from './site-fixture.mjs'

test('configured destinations work for direct links, fragments, and clicks', () => {
  for (const [path, overview] of Object.entries(site.presentations))
    for (const suffix of ['', '#/1', '?cache=1#/2?clicks=17'])
      assert.equal(episodeOverviewUrl(site.origin + site.basePath + path + suffix, { site }), site.origin + site.basePath + overview)
})
test('unconfigured deployments and lookalike origins or paths never expose an exit', () => {
  for (const href of ['file:///Chapter/one.html', 'http://localhost:3030/1', 'http://slides.example.org/sample/Chapter/one.html', 'https://slides.example.org.evil.test/sample/Chapter/one.html', 'https://slides.example.org/sample-other/Chapter/one.html', site.origin + '/sample/Chapter/', site.origin + '/sample/unlisted.html', '', 'invalid', undefined])
    assert.equal(episodeOverviewUrl(href, { site }), null, String(href))
  assert.equal(episodeOverviewUrl(site.origin + site.basePath + 'Chapter/one.html'), null)
})
test('print, presenter, and embedded views suppress the control', () => {
  for (const flag of ['isPrintMode', 'isPresenter', 'isEmbedded'])
    assert.equal(episodeOverviewUrl(site.origin + site.basePath + 'Chapter/one.html', { site, [flag]: true }), null)
})
