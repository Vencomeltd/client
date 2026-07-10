import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function BlogDetails() {
  const { slug } = useParams();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/blog/${slug}`);
        if (!res.ok) { setNotFound(true); return; }
        const data = await res.json();
        const b = data.blog;
        setBlog(b);
        if (b?.title) {
          document.title = `${b.seoTitle || b.title} | VenCome Blog`;
          const setMeta = (selector, attr, content) => {
            let el = document.querySelector(selector);
            if (!el) { el = document.createElement("meta"); document.head.appendChild(el); }
            el.setAttribute(attr, content);
          };
          setMeta('meta[name="description"]', "content", b.seoDescription || b.excerpt || "");
          setMeta('meta[property="og:title"]', "content", `${b.seoTitle || b.title} | VenCome Blog`);
          setMeta('meta[property="og:description"]', "content", b.seoDescription || b.excerpt || "");
          setMeta('meta[property="og:image"]', "content", b.ogImage || b.coverImage || "https://www.vencome.com/vencome-og.jpg");
          setMeta('meta[property="og:url"]', "content", `https://www.vencome.com/blog/${b.slug}`);
          let canonical = document.querySelector('link[rel="canonical"]');
          if (!canonical) { canonical = document.createElement("link"); canonical.setAttribute("rel", "canonical"); document.head.appendChild(canonical); }
          canonical.setAttribute("href", `https://www.vencome.com/blog/${b.slug}`);
        }
      } catch {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };
    fetchBlog();
    return () => { document.title = "VenCome – Book & List Commercial Spaces | UK & Middle East"; };
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
          style={{ fontSize: 16, lineHeight: 1.8, color: "#374151" }}
          dangerouslySetInnerHTML={{ __html: blog.content }}
        />

        {blog.tags?.length > 0 && (
          <div style={{ marginTop: 48, paddingTop: 24, borderTop: "1px solid #E5E7EB", display: "flex", gap: 8, flexWrap: "wrap" }}>
            {blog.tags.map((tag) => (
              <span key={tag} style={{ fontSize: 13, color: "#6B7280", background: "#F3F4F6", padding: "4px 12px", borderRadius: 999 }}>#{tag}</span>
            ))}
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
