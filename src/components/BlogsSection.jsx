import { useState } from "react";
import BlogCard from "../components/BlogCard";
import { blogs as blogData } from "../data/blogs";
import { Link } from "react-router-dom";

export default function BlogSection() {
  const [visibleCount, setVisibleCount] = useState(4);

  const visibleBlogs = blogData.slice(0, visibleCount);

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <h1 className="text-3xl font-bold mb-6">Latest Blogs</h1>

      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {visibleBlogs.map((blog) => (
          <BlogCard key={blog.slug} blog={blog} />
        ))}
      </div>

      <div className="text-center mt-8">
        <Link
          to="/blog"
          className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/80 transition inline-block"
        >
          See More
        </Link>
      </div>
    </div>
  );
}
