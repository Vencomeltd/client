const IMAGE_WIDTHS = [480, 800, 1200, 1600];

// Photos uploaded before the WebP-variant pipeline are stored at their
// original size (some are 10-15 MB, and the homepage alone pulled 78 MB on
// mobile). In production they go through Vercel's image optimizer, which
// resizes them and serves WebP. Widths and quality must match "images" in
// vercel.json. If the optimizer ever fails, onError swaps the <img> back to
// the original file so nothing shows as broken.
const OPTIMIZE_HOSTS = [/\.r2\.dev$/i];
const OPT_QUALITY = 70;
const canOptimize = () => import.meta.env.PROD;

function isOptimizable(url) {
  if (typeof url !== "string" || !url) return false;
  if (/\.(svg|gif)(\?|$)/i.test(url)) return false;
  if (url.startsWith("/") && !url.startsWith("//")) {
    return /\.(jpe?g|png|webp)$/i.test(url);
  }
  try {
    const { protocol, hostname } = new URL(url);
    return protocol === "https:" && OPTIMIZE_HOSTS.some((re) => re.test(hostname));
  } catch {
    return false;
  }
}

// Smallest allowed width that is at least the requested one.
function pickWidth(width) {
  return IMAGE_WIDTHS.reduce(
    (best, w) => (w >= width && w < best ? w : best),
    IMAGE_WIDTHS[IMAGE_WIDTHS.length - 1]
  );
}

export function optimizedImageUrl(url, width = 800) {
  if (!canOptimize() || !isOptimizable(url)) return url;
  return `/_vercel/image?url=${encodeURIComponent(url)}&w=${pickWidth(width)}&q=${OPT_QUALITY}`;
}

function fallbackToOriginal(original) {
  return (event) => {
    const img = event.currentTarget;
    if (img.dataset.fallback === "1") return;
    img.dataset.fallback = "1";
    img.removeAttribute("srcset");
    img.src = original;
  };
}

// Props for an <img>: src plus srcSet so the browser picks a size that fits.
export function getResponsiveImageProps(url, width = 1200) {
  if (!url) return { src: url };

  // Property photos uploaded through the WebP-variant pipeline have filenames
  // like ".../abc123-w1600.webp" -- the URL stored on the property is always
  // the largest (1600w) variant, with the smaller widths generated and
  // uploaded alongside it.
  if (/-w\d+\.webp$/.test(url)) {
    const srcSet = IMAGE_WIDTHS.map(
      (w) => `${url.replace(/-w\d+\.webp$/, `-w${w}.webp`)} ${w}w`
    ).join(", ");
    return { src: url, srcSet };
  }

  if (!canOptimize() || !isOptimizable(url)) return { src: url };

  const srcSet = IMAGE_WIDTHS.map((w) => `${optimizedImageUrl(url, w)} ${w}w`).join(", ");
  return { src: optimizedImageUrl(url, width), srcSet, onError: fallbackToOriginal(url) };
}
