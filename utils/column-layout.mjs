export const CONTENT_WIDTH = 1806
export const COLUMN_GAP = 100

/** Keep the original types independent of the new columns parameter. */
export function resolveColumns(slideType, requestedColumns) {
  const count = slideType === 'General content two column' ? 2
    : slideType === 'General content columns' ? requestedColumns : 1
  if (!Number.isInteger(count) || count < 1) {
    return { count: 1, width: CONTENT_WIDTH, error: 'General content columns requires columns to be a positive integer.' }
  }
  const width = (CONTENT_WIDTH - COLUMN_GAP * (count - 1)) / count
  if (width <= 0) {
    return { count: 1, width: CONTENT_WIDTH, error: 'The requested columns leave no content width with the standard 100 px gaps.' }
  }
  return { count, width, error: '' }
}
