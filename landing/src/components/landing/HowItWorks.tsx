import React from 'react';

interface HowItWorksCardProps {
  emoji: string;
  title: string;
  description: string;
  className?: string;
}

const HowItWorksCard = ({ emoji, title, description, className }: HowItWorksCardProps) => {
  return (
    <div className={`max-w-80 h-64 ${className} text-left p-5 rounded-sm shadow-xl md:hover:-translate-y-1 md:hover:shadow-2xl transition-transform`}>
      <div className="text-4xl mb-3">{emoji}</div>
      <h4 className="sm:text-lg font-bold text-gray-800 mb-2">
        {title}
      </h4>
      <p className="font-handlee text-gray-700 leading-relaxed">
        {description}
      </p>
    </div>
  );
};

export default HowItWorksCard;
