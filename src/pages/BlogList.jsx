import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const CATEGORIES = ["All", "News", "Guides", "Industry", "Tips", "Updates", "Case Studies"];

export default function BlogList() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("All");

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const url = activeCategory === "All"
          ? `${import.meta.env.VITE_API_URL}/blog`
          : `${import.meta.env.VITE_API_URL}/blog?category=${activeCategory}`;
        const res = await fetch(url);
        const data = await res.json();
        setBlogs(data.blogs || []);
      } catch (err) {
        console.error("Failed to fetch blogs:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchBlogs();
  }, [activeCategory]);

  return (
    <div style={{ minHeight: "100vh", background: "#F8F6F0" }}>
      <Navbar />
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "80px 24px 80px" }}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <h1 style={{ fontSize: 40, fontWeight: 800, color: "#0A1628", marginBottom: 12 }}>VenCome Blog</h1>
          <p style={{ fontSize: 17, color: "#6B7280", maxWidth: 500, margin: "0 auto" }}>
            Insights, guides, and news from the world of commercial space.
          </p>
        </div>

        {/* Category filter */}
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center", marginBottom: 48 }}>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => { setActiveCategory(cat); setLoading(true); }}
              style={{
                padding: "8px 20px",
                borderRadius: 999,
                border: "1.5px solid",
                borderColor: activeCategory === cat ? "#0A1628" : "#E5E7EB",
                background: activeCategory === cat ? "#0A1628" : "#fff",
                color: activeCategory === cat ? "#fff" : "#374151",
                fontSize: 14,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 24 }}>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} style={{ background: "#fff", borderRadius: 16, overflow: "hidden", border: "1.5px solid #E5E7EB" }}>
                <div style={{ height: 200, background: "#F3F4F6" }} />
                <div style={{ padding: 24 }}>
                  <div style={{ height: 14, background: "#F3F4F6", borderRadius: 8, marginBottom: 10, width: "60%" }} />
                  <div style={{ height: 20, background: "#F3F4F6", borderRadius: 8, marginBottom: 8 }} />
                  <div style={{ height: 14, background: "#F3F4F6", borderRadius: 8, width: "80%" }} />
                </div>
              </div>
            ))}
          </div>
        ) : blogs.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 0" }}>
            <p style={{ fontSize: 18, color: "#6B7280" }}>No blogs published yet. Check back soon.</p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 24 }}>
            {blogs.map((blog) => (
              <Link
                key={blog._id}
                to={`/blog/${blog.slug}`}
                style={{ textDecoration: "none" }}
              >
                <div style={{ background: "#fff", borderRadius: 16, overflow: "hidden", border: "1.5px solid #E5E7EB", transition: "box-shadow 0.2s", cursor: "pointer" }}
                  onMouseEnter={e => e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.10)"}
                  onMouseLeave={e => e.currentTarget.style.boxShadow = "none"}
                >
                  {blog.coverImage ? (
                    <img src={blog.coverImage} alt={blog.title} style={{ width: "100%", height: 200, objectFit: "cover" }} />
                  ) : (
                    <div style={{ height: 200, background: "linear-gradient(135deg, #0A1628 0%, #305CDE 100%)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <span style={{ fontSize: 40 }}>✍️</span>
                    </div>
                  )}
                  <div style={{ padding: 24 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: "#305CDE", background: "rgba(48,92,222,0.08)", padding: "3px 10px", borderRadius: 999 }}>
                        {blog.category}
                      </span>
                      <span style={{ fontSize: 12, color: "#9CA3AF" }}>{blog.readTime} min read</span>
                    </div>
                    <h2 style={{ fontSize: 18, fontWeight: 700, color: "#0A1628", marginBottom: 8, lineHeight: 1.4 }}>{blog.title}</h2>
                    <p style={{ fontSize: 14, color: "#6B7280", lineHeight: 1.6, marginBottom: 16 }}>{blog.excerpt}</p>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <span style={{ fontSize: 13, color: "#9CA3AF" }}>
                        {blog.publishedAt ? new Date(blog.publishedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : ""}
                      </span>
                      <span style={{ fontSize: 13, fontWeight: 600, color: "#305CDE" }}>Read more →</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
