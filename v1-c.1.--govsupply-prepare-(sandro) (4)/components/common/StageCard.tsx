import React from 'react';

interface StageCardProps {
    stage: {
        id: number;
        IconComponent: React.FC<React.SVGProps<SVGSVGElement>>;
        imageUrl: string;
        stepText: string;
        title: string;
        description: string;
    }
}

export const StageCard: React.FC<StageCardProps> = ({ stage }) => {
    const { IconComponent, imageUrl, stepText, title, description } = stage;

    return (
        <div className="bg-white dark:bg-navy rounded-xl border border-medium-gray/20 dark:border-white/10 shadow-md overflow-hidden text-left transform hover:-translate-y-1 transition-transform duration-300 h-full flex flex-col">
            <img 
                src={imageUrl} 
                alt={title} 
                className="w-full h-32 object-cover flex-shrink-0" 
            />
            <div className="p-6 flex-grow">
                <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <IconComponent className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-medium-gray dark:text-medium-gray/80">{stepText}</p>
                        <h3 className="text-lg font-bold text-navy dark:text-white">{title}</h3>
                    </div>
                </div>
                <p className="mt-4 text-sm text-navy/80 dark:text-light-gray/80">{description}</p>
            </div>
        </div>
    );
};