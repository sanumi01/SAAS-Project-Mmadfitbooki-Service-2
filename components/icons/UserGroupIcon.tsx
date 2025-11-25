import React from 'react';

export const UserGroupIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-6 h-6"}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m-7.5-2.962c.57-1.023.57-2.307 0-3.33.57-1.023.57-2.307 0-3.33m0 6.66l-3-1.666a2.25 2.25 0 00-2.16-2.16l-1.666-3c-.164-.296-.164-.654 0-.951l1.666-3a2.25 2.25 0 012.16-2.16l3-1.666c.296-.164.654-.164.951 0l3 1.666a2.25 2.25 0 012.16 2.16l1.666 3c.164.296.164.654 0 .951l-1.666 3a2.25 2.25 0 01-2.16 2.16l-3 1.666c-.296.164-.654-.164-.951 0z" />
    </svg>
);