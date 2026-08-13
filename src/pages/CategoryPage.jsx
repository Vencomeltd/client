import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLoaderData } from "react-router-dom";
import { apiFetch } from "../utils/api";
import Card from "../components/EvenCard";
import VencomeLoader from "../components/Loader";
import TagList from "../components/TagList";
import CategoryList from "../components/CategoryList";

export async function loader({ params }) {
  const res = await fetch(`${import.meta.env.VITE_API_URL}/categories/${params.id}`);
  if (!res.ok) return { category: null, properties: [] };
  const data = await res.json();
  return { category: data.category || null, properties: data.properties || [] };
}

export function meta({ data }) {
  const category = data?.category;
  if (!category) return [{ title: "Category | VenCome" }];
  return [
    { title: `${category.name} Spaces | VenCome` },
    {
      name: "description",
      content: category.description || `Browse ${category.name} spaces available to book on VenCome.`,
    },
  ];
}

const CategoryPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const loaderData = useLoaderData();
  const [category, setCategory] = useState(loaderData?.category || null);
  const [subCategory, setSubCategory] = useState(loaderData?.category?.subcategories || null);
  const [activeTags, setActiveTags] = useState([]);
  const [properties, setProperties] = useState(loaderData?.properties || []);
  const [loading, setLoading] = useState(!loaderData?.category);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const catData = await apiFetch({ endpoint: `/categories/${id}` });
        setCategory(catData.category);
        setSubCategory(catData.category.subcategories);
        setProperties(catData.properties);
        setError("");
      } catch (err) {
        setError("Failed to load category");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleCategorySelect = (categoryId) => {
    setSelectedCategory(categoryId); // Filter properties by category
  };

  const filteredProperties =
    activeTags.length === 0
      ? properties
      : properties.filter((property) =>
          activeTags.includes(property.subcategory)
        );

  if (loading) {
    return <VencomeLoader />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <div className="container w-full mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Category Header */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-2">
            {category.name}
          </h1>
          {category.description && (
            <p className="text-lg text-gray-600 max-w-3xl">
              {category.description}
            </p>
          )}
          {subCategory?.length > 0 && (
            <div className="container flex gap-3 items-center mt-4">
              {subCategory?.length > 0 && (
                <CategoryList
                  type="subcategory"
                  categories={subCategory}
                  onSelect={handleCategorySelect}
                />
              )}
            </div>
          )}
        </div>

        {/* Properties Grid */}
        {properties.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg mb-4">
              No spaces listed in this category yet.
            </p>
            <button
              onClick={() => navigate("/create-space")}
              className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/80"
            >
              Be the First to List
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProperties.map((property) => (
              <Card key={property._id} id={property._id} data={property} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryPage;
