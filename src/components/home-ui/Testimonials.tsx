import React from "react";

const Testimonials: React.FC = () => {
  const testimonials = [
    {
      quote: "The perfect way to express love from miles away.",
      author: "Sarah M.",
      role: "Happy Gifter",
    },
    {
      quote: "Itiza made our anniversary extra special.",
      author: "James & Emma",
      role: "Loving Couple",
    },
  ];

  return (
    <section className="py-24 bg-itiza-cream">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-4xl font-serif text-center text-gray-900 mb-16">
          Love Stories
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="bg-white p-8 rounded-2xl shadow-lg">
              <p className="text-xl text-gray-600 mb-6 italic">
                "{testimonial.quote}"
              </p>
              <div className="flex items-center">
                <div className="ml-4">
                  <p className="font-serif text-gray-900">
                    {testimonial.author}
                  </p>
                  <p className="text-sm text-gray-500">{testimonial.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
