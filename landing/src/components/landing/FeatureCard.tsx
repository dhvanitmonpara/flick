import { JSX, ReactNode } from "react";

interface FeatureCardProps {
  icon: JSX.Element | string;
  title: string;
  description: ReactNode;
}

export const FeatureCard = ({ icon, title, description }: FeatureCardProps) => {
  const renderIcon = () => {
    if (typeof icon === 'string') {
      return <span className="text-3xl">{icon}</span>;
    }
    return icon;
  };

  return (
    <div className="flex items-start sm:flex-col md:flex-row space-x-6 sm:space-x-0 md:space-x-6 sm:space-y-4 md:space-y-0 rounded-2xl shadow-lg border border-zinc-200 bg-zinc-100/80 p-6 hover:border-zinc-400 transition-colors duration-200">
      <div className="flex items-center justify-center h-12 w-12 sm:w-14 sm:h-14 rounded-full bg-zinc-200/80">
        {renderIcon()}
      </div>
      <div className="space-y-1">
        <h3 className="text-lg sm:text-xl font-inter text-start font-semibold text-zinc-900">
          {title}
        </h3>
        <p className="text-sm text-start text-zinc-600 leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  );
};
