import React from "react";

const Features: React.FC = () => {
  const features = [
    {
      title: "Emotional Storytelling",
      description:
        "Create meaningful connections through personalized gift messages",
      icon: "❤️",
    },
    {
      title: "Curated Selection",
      description: "Hand-picked luxury items from premium merchants",
      icon: "✨",
    },
    {
      title: "Loyalty Rewards",
      description: "Earn points for meaningful giving",
      icon: "🎁",
    },
  ];

  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-4xl font-serif text-center text-gray-900 mb-16">
          Why Choose <span className="text-itiza-gold">Itiza</span>?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {features.map((feature, index) => (
            <div
              key={index}
              className="text-center p-8 rounded-2xl hover:shadow-xl transition-shadow duration-300"
            >
              <div className="text-4xl mb-6">{feature.icon}</div>
              <h3 className="text-2xl font-serif text-gray-900 mb-4">
                {feature.title}
              </h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
