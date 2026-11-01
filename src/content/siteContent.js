// Editable site text (admin -> Site content). Every block has a key, a default
// here in the bundle, and an optional override published from admin (served
// by GET /api/site-content and loaded in root.jsx's loader). Pages always
// start from these defaults, so nothing renders empty if the API is down.
//
// rich: true allows **bold** and [link text](https://...) -- nothing else.
// max: character limit, so an edit can't break the layout.
const SITE_TITLE = "VenCome – Book & List Commercial Spaces | UK";
const SITE_DESCRIPTION =
  "VenCome is the UK's B2B marketplace for commercial spaces — book offices, studios, treatment rooms, meeting rooms, and event venues by the hour, day, or month.";

export const SITE_CONTENT_GROUPS = [
  "Home",
  "Search",
  "City pages",
  "Category pages",
  "Listing page",
  "Host landing",
  "About",
  "Contact",
  "Footer",
  "Emails footer",
];

export const SITE_CONTENT_BLOCKS = [
  // Home
  { key: "home.hero.headline", group: "Home", label: "Hero headline", max: 60, default: "The Easiest Way To Grow Your Business" },
  { key: "home.hero.subtitle", group: "Home", label: "Hero subtitle", max: 80, default: "Commercial Spaces, Booked Simply" },
  { key: "home.categories.eyebrow", group: "Home", label: "Categories label", max: 40, default: "Browse by Category" },
  { key: "home.popular.heading", group: "Home", label: "Popular spaces heading", max: 50, default: "Popular Spaces Near You" },
  { key: "home.how.heading", group: "Home", label: "How it works heading", max: 50, default: "How VenCome Works" },
  { key: "home.how.subtitle", group: "Home", label: "How it works subtitle", max: 120, default: "Find and book commercial spaces in three simple steps." },
  { key: "home.faq.heading", group: "Home", label: "FAQ heading", max: 50, default: "Frequently Asked Questions" },
  { key: "home.faq.subtitle", group: "Home", label: "FAQ subtitle", max: 120, default: "Everything you need to know about VenCome." },
  { key: "home.contact.heading", group: "Home", label: "\"Couldn't find\" heading", max: 60, default: "Couldn't find what you're looking for?" },
  { key: "home.contact.body", group: "Home", label: "\"Couldn't find\" text", max: 200, default: "Tell us the space you need — area, size, dates and budget — and our team will find options for you." },
  { key: "seo.home.title", group: "Home", label: "SEO title", max: 70, seo: true, default: SITE_TITLE },
  { key: "seo.home.description", group: "Home", label: "SEO meta description", max: 160, seo: true, default: SITE_DESCRIPTION },

  // Search
  { key: "search.empty.heading", group: "Search", label: "No results heading", max: 60, default: "No spaces match your search" },
  { key: "search.empty.body", group: "Search", label: "No results text", max: 120, default: "Try adjusting your filters or search a different location" },

  // City pages (the per-city intro stays in the Markets editor)
  { key: "city.faq.heading", group: "City pages", label: "FAQ heading", max: 50, default: "Frequently asked questions" },

  // Category pages (category descriptions stay in the Categories editor)
  { key: "category.soon.eyebrow", group: "Category pages", label: "Empty category label", max: 30, default: "Coming Soon" },
  { key: "category.soon.body", group: "Category pages", label: "Empty category text", max: 220, default: "We're onboarding hosts in this category right now. Browsing and booking will open shortly — but you can list your space today and be ready the moment it goes live." },

  // Listing page
  { key: "listing.booking.note", group: "Listing page", label: "Note under the booking buttons", max: 60, default: "You won't be charged yet" },

  // Host landing (the homepage section for property owners)
  { key: "host.eyebrow", group: "Host landing", label: "Label", max: 40, default: "For Property Owners" },
  { key: "host.heading", group: "Host landing", label: "Heading", max: 60, default: "List Your Space. Start Earning." },
  { key: "host.body", group: "Host landing", label: "Text", max: 220, rich: true, default: "Join hundreds of commercial property owners earning consistent revenue through VenCome. List your space in under 10 minutes - we handle payments, contracts, and disputes." },
  { key: "host.button", group: "Host landing", label: "Button", max: 30, default: "Publish Your Space" },

  // About
  { key: "about.title", group: "About", label: "Page title", max: 50, default: "About VenCome" },
  { key: "about.subtitle", group: "About", label: "Subtitle", max: 120, default: "We're removing the friction from finding and booking commercial space." },
  {
    key: "about.story",
    group: "About",
    label: "Our story",
    max: 2500,
    rich: true,
    default:
      "Founded in London, VenCome was born from a simple but frustrating experience.\n\nWhile studying, our Founder set out to pursue aesthetics as a side venture — big ambition, limited budget. When it came to finding flexible space to work from, the process proved harder than it should be: unresponsive hosts, compliance headaches, unclear pricing, monthly-only commitments, and listings that never quite matched the right area, time, or price.\n\nAs an entrepreneurship student, she had learned to see problems as opportunities. This one was impossible to ignore.\n\n**She asked herself: why can't booking a professional space be as simple as booking a hotel?**\n\nThat question became VenCome — a marketplace where commercial spaces and professionals connect effortlessly, whether you need a treatment room in London today or a studio in New York tomorrow. Together with her co-founder, they turned an idea into a market-ready solution: the platform she wished had existed — transparent, responsive, and powered by an AI Matchmaker that cuts through the noise to find exactly what you need, fast.\n\nVenCome exists to remove the friction from starting and growing a business — so that budget, location, or limited connections are never what stands between a professional and their potential.",
  },
  { key: "about.mission", group: "About", label: "Our mission", max: 400, rich: true, default: "To become the world's leading marketplace for commercial and professional space rental — trusted by businesses of every size, in every major city, for any duration." },
  { key: "seo.about.title", group: "About", label: "SEO title", max: 70, seo: true, default: SITE_TITLE },
  { key: "seo.about.description", group: "About", label: "SEO meta description", max: 160, seo: true, default: SITE_DESCRIPTION },

  // Contact
  { key: "contact.title", group: "Contact", label: "Page title", max: 50, default: "Contact Us" },
  { key: "contact.subtitle", group: "Contact", label: "Subtitle", max: 120, default: "We'd love to hear from you." },
  {
    key: "contact.intro",
    group: "Contact",
    label: "Get in touch text",
    max: 600,
    rich: true,
    default:
      "The quickest way to reach us is by email at [support@vencome.com](mailto:support@vencome.com). We aim to reply within 24 hours.\n\nTo help us route your message quickly, let us know upfront whether you're a guest, a host, or reaching out about something else — press, partnerships, careers, and so on.",
  },
  { key: "seo.contact.title", group: "Contact", label: "SEO title", max: 70, seo: true, default: SITE_TITLE },
  { key: "seo.contact.description", group: "Contact", label: "SEO meta description", max: 160, seo: true, default: SITE_DESCRIPTION },

  // Footer
  { key: "footer.tagline", group: "Footer", label: "Tagline under the logo", max: 160, default: "Discover the worlds most exceptional commercial spaces, from offices and studios to venues and landmark locations." },

  // Emails footer (used by the server's email frame, utils/emailTemplates.js)
  { key: "emails.footer", group: "Emails footer", label: "Footer line on every email", max: 200, rich: true, default: "This is an automated message, please do not reply." },
];

export const SITE_CONTENT_DEFAULTS = Object.fromEntries(SITE_CONTENT_BLOCKS.map((block) => [block.key, block.default]));

// Static pages whose SEO title/description live here, by path (root.jsx meta).
export const SEO_PAGE_BY_PATH = { "/": "home", "/about": "about", "/contact": "contact" };

// "**bold** and [text](url)" -> [{ type: "text" | "bold" | "link", text, href }]
// per paragraph (blank line = new paragraph). Only http(s) and mailto links.
export function parseRichText(value) {
  return String(value || "")
    .split(/\n\s*\n/)
    .map((paragraph) => {
      const parts = [];
      const pattern = /\*\*(.+?)\*\*|\[([^\]]+)\]\(((?:https?:\/\/|mailto:|\/)[^)\s]+)\)/g;
      let last = 0;
      let match;
      while ((match = pattern.exec(paragraph))) {
        if (match.index > last) parts.push({ type: "text", text: paragraph.slice(last, match.index) });
        parts.push(match[1] ? { type: "bold", text: match[1] } : { type: "link", text: match[2], href: match[3] });
        last = pattern.lastIndex;
      }
      if (last < paragraph.length) parts.push({ type: "text", text: paragraph.slice(last) });
      return parts;
    })
    .filter((parts) => parts.length);
}
