const IMAGE_WIDTHS = [480, 800, 1200, 1600];

// Property photos uploaded through the WebP-variant pipeline have filenames
// like ".../abc123-w1600.webp" -- the URL stored on the property is always
// the largest (1600w) variant, with the smaller widths generated and
// uploaded alongside it. Deriving srcSet from the URL string this way means
// no new DB field or backend response-shape change was needed.
export function getResponsiveImageProps(url) {
  if (!url) return { src: url };

  if (!/-w\d+\.webp$/.test(url)) return { src: url };

  const srcSet = IMAGE_WIDTHS.map(
    (w) => `${url.replace(/-w\d+\.webp$/, `-w${w}.webp`)} ${w}w`
  ).join(", ");

  return { src: url, srcSet };
}
