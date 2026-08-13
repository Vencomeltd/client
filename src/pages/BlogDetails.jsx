import { useState, useEffect } from "react";
import { useParams, Link, useLoaderData } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export async function loader({ params }) {
  const res = await fetch(`${import.meta.env.VITE_API_URL}/blog/${params.slug}`);
  if (!res.ok) return { blog: null };
  const data = await res.json();
  return { blog: data.blog || null };
}

export function meta({ data }) {
  const b = data?.blog;
  if (!b?.title) return [{ title: "Blog not found | VenCome" }];

  const title = `${b.seoTitle || b.title} | VenCome Blog`;
  const description = b.seoDescription || b.excerpt || "";
  const image = b.ogImage || b.coverImage || "https://www.vencome.com/vencome-og.jpg";
  const url = `https://www.vencome.com/blog/${b.slug}`;

  return [
    { title },
    { name: "description", content: description },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:image", content: image },
    { property: "og:url", content: url },
    { property: "og:type", content: "article" },
    { tagName: "link", rel: "canonical", href: url },
    ...(b.tags || []).map((tag) => ({ property: "article:tag", content: tag })),
  ];
}

export default function BlogDetails() {
  const { slug } = useParams();
  const loaderData = useLoaderData();
  const [blog, setBlog] = useState(loaderData?.blog || null);
  const [loading, setLoading] = useState(!loaderData);
  const [notFound, setNotFound] = useState(loaderData ? !loaderData.blog : false);
  const [recentBlogs, setRecentBlogs] = useState([]);
  const [copied, setCopied] = useState(false);
  const postUrl = blog ? `https://www.vencome.com/blog/${blog.slug}` : "";

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/blog/${slug}`);
        if (!res.ok) { setNotFound(true); return; }
        const data = await res.json();
        setBlog(data.blog);
      } catch {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };
    fetchBlog();
  }, [slug]);

  useEffect(() => {
    const fetchRecent = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/blog?limit=4`);
        const data = await res.json();
        setRecentBlogs((data.blogs || []).filter(b => b.slug !== slug).slice(0, 3));
      } catch {}
    };
    fetchRecent();
  }, [slug]);

  if (loading) return (
    <div style={{ minHeight: "100vh", background: "#F8F6F0" }}>
      <Navbar />
      <div style={{ maxWidth: 760, margin: "0 auto", padding: "80px 24px" }}>
        <div style={{ height: 40, background: "#F3F4F6", borderRadius: 8, marginBottom: 20, width: "70%" }} />
        <div style={{ height: 300, background: "#F3F4F6", borderRadius: 16, marginBottom: 32 }} />
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} style={{ height: 16, background: "#F3F4F6", borderRadius: 8, marginBottom: 12, width: i % 3 === 0 ? "90%" : "100%" }} />
        ))}
      </div>
      <Footer />
    </div>
  );

  if (notFound) return (
    <div style={{ minHeight: "100vh", background: "#F8F6F0" }}>
      <Navbar />
      <div style={{ maxWidth: 760, margin: "0 auto", padding: "80px 24px", textAlign: "center" }}>
        <h1 style={{ fontSize: 32, fontWeight: 800, color: "#0A1628", marginBottom: 16 }}>Blog not found</h1>
        <Link to="/blog" style={{ color: "#305CDE", fontWeight: 600 }}>← Back to Blog</Link>
      </div>
      <Footer />
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#F8F6F0" }}>
      <Navbar />
      <article style={{ maxWidth: 760, margin: "0 auto", padding: "60px 24px 80px" }}>
        <Link to="/blog" style={{ fontSize: 14, color: "#6B7280", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 32 }}>
          ← Back to Blog
        </Link>

        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: "#305CDE", background: "rgba(48,92,222,0.08)", padding: "4px 12px", borderRadius: 999 }}>
            {blog.category}
          </span>
          <span style={{ fontSize: 13, color: "#9CA3AF" }}>{blog.readTime} min read</span>
        </div>

        <h1 style={{ fontSize: 36, fontWeight: 800, color: "#0A1628", lineHeight: 1.3, marginBottom: 16 }}>{blog.title}</h1>

        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 32, paddingBottom: 24, borderBottom: "1px solid #E5E7EB" }}>
          <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#0A1628", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ color: "#fff", fontSize: 14, fontWeight: 700 }}>{(blog.author || "V")[0]}</span>
          </div>
          <div>
            <p style={{ fontSize: 14, fontWeight: 700, color: "#0A1628", margin: 0 }}>{blog.author || "VenCome Team"}</p>
            <p style={{ fontSize: 13, color: "#9CA3AF", margin: 0 }}>
              {blog.publishedAt ? new Date(blog.publishedAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }) : ""}
            </p>
          </div>
        </div>

        {blog.coverImage && (
          <img src={blog.coverImage} alt={blog.title} style={{ width: "100%", borderRadius: 16, marginBottom: 40, maxHeight: 440, objectFit: "cover" }} />
        )}

        <div
          className="blog-content"
          style={{ fontSize: 16, lineHeight: 1.8, color: "#374151" }}
          dangerouslySetInnerHTML={{ __html: blog.content }}
        />

        {blog.tags?.length > 0 && (
          <div style={{ marginTop: 48, paddingTop: 24, borderTop: "1px solid #E5E7EB", display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: "#6B7280", marginRight: 4 }}>Tags:</span>
            {blog.tags.map((tag) => (
              <span key={tag} style={{ fontSize: 13, color: "#305CDE", background: "rgba(48,92,222,0.08)", padding: "4px 12px", borderRadius: 999, fontWeight: 500 }}>#{tag}</span>
            ))}
          </div>
        )}

        {/* Share Section */}
        <div style={{ marginTop: 32, padding: 24, background: "#F8F6F0", borderRadius: 16, border: "1.5px solid #E5E7EB" }}>
          <p style={{ fontSize: 14, fontWeight: 700, color: "#0A1628", marginBottom: 16 }}>Share this article</p>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <a
              href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(blog.title)}&url=${encodeURIComponent(postUrl)}`}
              target="_blank"
              rel="noreferrer"
              style={{ padding: "8px 16px", borderRadius: 8, background: "#000", color: "#fff", fontSize: 13, fontWeight: 600, textDecoration: "none", display: "flex", alignItems: "center", gap: 6 }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.259 5.631 5.905-5.631zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              Share
            </a>
            <a
              href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(postUrl)}`}
              target="_blank"
              rel="noreferrer"
              style={{ padding: "8px 16px", borderRadius: 8, background: "#1877F2", color: "#fff", fontSize: 13, fontWeight: 600, textDecoration: "none", display: "flex", alignItems: "center", gap: 6 }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              Facebook
            </a>
            <a
              href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(postUrl)}`}
              target="_blank"
              rel="noreferrer"
              style={{ padding: "8px 16px", borderRadius: 8, background: "#0077B5", color: "#fff", fontSize: 13, fontWeight: 600, textDecoration: "none", display: "flex", alignItems: "center", gap: 6 }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
              LinkedIn
            </a>
            <a
              href={`https://wa.me/?text=${encodeURIComponent(blog.title + " " + postUrl)}`}
              target="_blank"
              rel="noreferrer"
              style={{ padding: "8px 16px", borderRadius: 8, background: "#25D366", color: "#fff", fontSize: 13, fontWeight: 600, textDecoration: "none", display: "flex", alignItems: "center", gap: 6 }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              WhatsApp
            </a>
            <button
              onClick={() => { navigator.clipboard.writeText(postUrl); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
              style={{ padding: "8px 16px", borderRadius: 8, background: copied ? "#16A34A" : "#0A1628", color: "#fff", fontSize: 13, fontWeight: 600, border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>
              {copied ? "✓ Copied!" : "Copy Link"}
            </button>
          </div>
        </div>

        {recentBlogs.length > 0 && (
          <div style={{ marginTop: 56 }}>
            <h3 style={{ fontSize: 22, fontWeight: 800, color: "#0A1628", marginBottom: 24 }}>Recent Articles</h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 20 }}>
              {recentBlogs.map((rb) => (
                <a key={rb._id} href={`/blog/${rb.slug}`} style={{ textDecoration: "none" }}>
                  <div style={{ background: "#F8F6F0", borderRadius: 14, overflow: "hidden", border: "1.5px solid #E5E7EB" }}>
                    {rb.coverImage ? (
                      <img src={rb.coverImage} alt={rb.title} style={{ width: "100%", height: 130, objectFit: "cover" }} />
                    ) : (
                      <div style={{ height: 130, background: "linear-gradient(135deg, #0A1628, #305CDE)" }} />
                    )}
                    <div style={{ padding: 16 }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: "#305CDE", background: "rgba(48,92,222,0.08)", padding: "2px 8px", borderRadius: 999 }}>{rb.category}</span>
                      <p style={{ fontSize: 14, fontWeight: 700, color: "#0A1628", margin: "8px 0 4px", lineHeight: 1.4 }}>{rb.title}</p>
                      <p style={{ fontSize: 12, color: "#6B7280" }}>{rb.readTime} min read</p>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}

        <div style={{ marginTop: 48, padding: 32, background: "#0A1628", borderRadius: 20, textAlign: "center" }}>
          <h3 style={{ fontSize: 22, fontWeight: 800, color: "#fff", marginBottom: 8 }}>Find your perfect commercial space</h3>
          <p style={{ fontSize: 15, color: "rgba(255,255,255,0.7)", marginBottom: 20 }}>Browse offices, studios, meeting rooms and more across the UK and Middle East.</p>
          <Link to="/search" style={{ display: "inline-block", padding: "14px 32px", background: "#305CDE", color: "#fff", borderRadius: 10, fontWeight: 700, textDecoration: "none", fontSize: 15 }}>
            Browse Spaces
          </Link>
        </div>
      </article>
      <Footer />
    </div>
  );
}
