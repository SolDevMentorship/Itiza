import React from "react";

const GiftCategories: React.FC = () => {
  const gifts = [
    {
      title: "Jewelry",
      image: "/images/jewelry.jpg",
      message: "For those special moments that sparkle",
    },
    {
      title: "Wine & Spirits",
      image: "/images/wine.jpg",
      message: "Toast to your love story",
    },
    {
      title: "Teddy Bears",
      image: "/images/teddy.jpg",
      message: "Cuddly companions for your loved ones",
    },
  ];

  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-4xl font-serif text-center text-gray-900 mb-16">
          Explore Our Gifts
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {gifts.map((gift, index) => (
            <div
              key={index}
              className="group relative overflow-hidden rounded-2xl cursor-pointer"
            >
              <div className="aspect-w-4 aspect-h-3">
                <img
                  src={gift.image}
                  alt={gift.title}
                  className="object-cover w-full h-full transform group-hover:scale-110 transition-transform duration-300"
                />
              </div>
              <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <div className="text-center text-white p-6">
                  <h3 className="text-2xl font-serif mb-2">{gift.title}</h3>
                  <p className="text-sm">{gift.message}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default GiftCategories;
