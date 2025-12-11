import React from 'react';

const SkeletonCard = () => {
  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm p-4 space-y-4">
      {/* Image Skeleton */}
      <div className="h-48 bg-gray-200 rounded-xl animate-pulse" />
      
      {/* Text Skeletons */}
      <div className="space-y-2">
        <div className="h-3 bg-gray-200 rounded w-1/3 animate-pulse" /> {/* Category */}
        <div className="h-5 bg-gray-200 rounded w-3/4 animate-pulse" /> {/* Title */}
      </div>

      {/* Price Skeleton */}
      <div className="flex justify-between items-center pt-2">
        <div className="h-6 bg-gray-200 rounded w-1/2 animate-pulse" />
        <div className="h-8 bg-gray-200 rounded w-8 animate-pulse" />
      </div>
    </div>
  );
};

export default SkeletonCard;