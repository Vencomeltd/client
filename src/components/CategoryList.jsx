import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

import CategoryCard from "./CategoryCard";

const CategoryList = ({ type = "category", categories = [], onSelect }) => {
  const hasCategories = Array.isArray(categories) && categories.length > 0;

  return (
    <>
      {hasCategories ? (
        <Swiper
          modules={[Navigation, Pagination, Autoplay]}
          spaceBetween={20}
          slidesPerView={1}
          navigation
          autoplay={{ delay: 3000 }}
          loop={true}
          breakpoints={{
            640: { slidesPerView: 2 },
            1024: { slidesPerView: 3 },
            1280: { slidesPerView: 4 },
          }}
        >
          {categories.map((card) => (
            <SwiperSlide key={card._id}>
              <CategoryCard
                id={card.slug || card._id}
                type={type}
                imageUrl={card.image}
                title={card.name}
                buttonText={card.buttonText}
                description={card.description}
                onClick={() => onSelect?.(card)} // ✅ optional chaining
              />
            </SwiperSlide>
          ))}
        </Swiper>
      ) : (
        <p className="text-gray-600 text-lg text-center mt-10">
          No categories available at the moment.
        </p>
      )}
    </>
  );
};

export default CategoryList;
