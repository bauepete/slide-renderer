// Preserve the whole image and at least two source pixels per canvas pixel.
export function fitSupportingImage(sourceWidth, sourceHeight, boxWidth, boxHeight) {
  if ([sourceWidth, sourceHeight, boxWidth, boxHeight].some(value => !Number.isFinite(value) || value <= 0)) return { width: 0, height: 0 }
  const scale = Math.min(0.5, boxWidth / sourceWidth, boxHeight / sourceHeight)
  return { width: sourceWidth * scale, height: sourceHeight * scale }
}
