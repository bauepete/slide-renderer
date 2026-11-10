import { definePreparserSetup } from '@slidev/types'
import { normalizeSlideMetadata } from '../utils/slide-metadata.mjs'

export default definePreparserSetup(() => [{
  name: 'course-slide-metadata',
  transformRawLines: normalizeSlideMetadata,
}])
