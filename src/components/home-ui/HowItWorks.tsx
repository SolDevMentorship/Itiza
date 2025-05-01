import React from "react";

const HowItWorks: React.FC = () => {
  const steps = [
    {
      step: "1",
      title: "Pick a Gift",
      description: "Choose from our curated luxury collection",
    },
    {
      step: "2",
      title: "Add Your Message",
      description: "Personalize or use our romantic defaults",
    },
    {
      step: "3",
      title: "Beautiful Delivery",
      description: "We handle the rest with care and elegance",
    },
  ];

  return (
    <section className="py-24 bg-itiza-cream">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-4xl font-serif text-center text-gray-900 mb-16">
          How It Works
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {steps.map((step, index) => (
            <div key={index} className="relative text-center p-8">
              <div className="w-12 h-12 rounded-full bg-itiza-gold text-white flex items-center justify-center text-xl font-bold mx-auto mb-6">
                {step.step}
              </div>
              <h3 className="text-2xl font-serif text-gray-900 mb-4">
                {step.title}
              </h3>
              <p className="text-gray-600">{step.description}</p>
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-1/2 right-0 transform translate-x-1/2 -translate-y-1/2 text-itiza-gold text-4xl">
                  →
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
