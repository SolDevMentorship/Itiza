import React from "react";
import { Layout } from "@/components/Layout";
import {
  pendant,
  goldring,
  teddybear,
  wristwatch,
  winebottle,
  velvetbox,
} from "@/images";

const categories = [
  {
    title: "Jewelry",
    description: "Timeless pieces for special moments",
    image: pendant,
    items: [pendant, goldring, wristwatch],
  },
  {
    title: "Plush Gifts",
    description: "Soft companions for your loved ones",
    image: teddybear,
    items: [teddybear],
  },
  {
    title: "Luxury Drinks",
    description: "Premium selections for celebrations",
    image: winebottle,
    items: [winebottle],
  },
  {
    title: "Gift Sets",
    description: "Curated collections for lasting impressions",
    image: velvetbox,
    items: [velvetbox],
  },
];

const Categories: React.FC = () => {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-24">
        <h1 className="text-4xl font-serif text-center text-gray-900 mb-16">
          Explore Our Gift Categories
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {categories.map((category, index) => (
            <div
              key={index}
              className="group relative overflow-hidden rounded-2xl cursor-pointer"
            >
              <div className="aspect-w-16 aspect-h-9">
                <img
                  src={category.image}
                  alt={category.title}
                  className="object-cover w-full h-full transform group-hover:scale-110 transition-transform duration-300"
                />
              </div>
              <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                <div className="text-center text-white p-6">
                  <h3 className="text-2xl font-serif mb-2">{category.title}</h3>
                  <p className="text-sm">{category.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default Categories;
