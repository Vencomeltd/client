// src/components/BlogCard.jsx
import { Link } from "react-router-dom";
import { optimizedImageUrl } from "../utils/responsiveImage";

export default function BlogCard({ blog }) {
  return (
    <article className="bg-white shadow-sm rounded-lg overflow-hidden hover:shadow-lg transition">
      <Link to={`/blog/${blog.slug}`} className="block">
        <img
          src={optimizedImageUrl(blog.featuredImage, 800)}
          loading="lazy"
          alt={blog.title}
          className="w-full h-44 object-cover"
        />
      </Link>

      <div className="p-4">
        <Link to={`/blog/${blog.slug}`}>
          <h3 className="text-lg font-semibold mb-2 line-clamp-2">
            {blog.title}
          </h3>
        </Link>

        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {blog.excerpt}
        </p>

        <div className="flex items-center justify-between text-xs text-gray-500">
          <div>{blog.author}</div>
          <div>
            {blog.date} • {blog.readingTime}
          </div>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {blog.categories.map((c) => (
            <span
              key={c}
              className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700"
            >
              {c}
            </span>
          ))}
        </div>
      </div>
    </article>
  );
}
