
import React from 'react';
import { Card } from '../common/Card';

interface TrialBannerProps {
    daysRemaining: number;
    staffCount: number;
    maxStaff: number;
}

export const TrialBanner: React.FC<TrialBannerProps> = ({ daysRemaining, staffCount, maxStaff }) => {
    const isExpired = daysRemaining <= 0;
    const staffUsagePercent = (staffCount / maxStaff) * 100;
    const daysUsagePercent = (daysRemaining / 28) * 100;

    const bannerClass = isExpired
        ? "border-red-500/50 bg-red-500/10"
        : "border-brand-secondary/50 bg-brand-secondary/10";

    return (
        <Card className={`animate-fade-in ${bannerClass}`}>
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex-grow">
                    <h3 className={`text-lg font-bold ${isExpired ? 'text-red-400' : 'text-brand-primary'}`}>
                        {isExpired ? 'Your Free Trial Has Ended' : 'You are on the Free Trial Plan'}
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 mt-2 text-sm">
                        <div>
                            <div className="flex justify-between text-text-primary/80 mb-1">
                                <span>Trial Period</span>
                                <span className="font-semibold text-text-primary">
                                    {daysRemaining} / 28 days left
                                </span>
                            </div>
                            <div className="w-full bg-border-dark rounded-full h-1.5">
                                <div className={`h-1.5 rounded-full ${isExpired ? 'bg-red-500' : 'bg-brand-primary'}`} style={{ width: `${daysUsagePercent}%` }}></div>
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between text-text-primary/80 mb-1">
                                <span>Staff Seats</span>
                                <span className="font-semibold text-text-primary">
                                    {staffCount} of {maxStaff} used
                                </span>
                            </div>
                            <div className="w-full bg-border-dark rounded-full h-1.5">
                                <div className="bg-yellow-400 h-1.5 rounded-full" style={{ width: `${staffUsagePercent}%` }}></div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex-shrink-0 mt-4 md:mt-0">
                    <button
                        disabled // This would link to a payment page in a real app
                        className="bg-brand-primary text-white font-bold py-2 px-6 rounded-md hover:bg-brand-secondary transition-colors disabled:bg-border-dark disabled:cursor-not-allowed focus-ring"
                    >
                        Upgrade to Pro
                    </button>
                </div>
            </div>
        </Card>
    );
};