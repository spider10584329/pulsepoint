'use client'

import { useState } from 'react'
import { Software } from '@/types/user/software'

interface SoftwareCardProps {
  software: Software
  onViewDetails: (software: Software) => void
}

export default function SoftwareCard({ software, onViewDetails }: SoftwareCardProps) {
  const [imageError, setImageError] = useState(false)

  const formatPrice = (price: string) => {
    return price ? `$${price}` : 'Contact Us'
  }

  return (
    <div className="bg-white rounded-lg sm:rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group cursor-pointer border border-gray-200 hover:border-gray-300">
      <div 
        onClick={() => onViewDetails(software)}
        className="flex flex-col h-full"
      >
        {/* Image Section */}
        <div className="relative h-40 sm:h-48 lg:h-56 bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
          {software.filename && !imageError ? (
            <img
              src={`http://localhost:5001/project/download?filepath=${software.filename}`}
              alt={software.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 rounded-full bg-white flex items-center justify-center">
                <img 
                  src="/svg/software.svg" 
                  alt="Software"
                  className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 opacity-70"
                />
              </div>
            </div>
          )}
          
          {/* Free Trial Badge */}
          <div className="absolute top-2 sm:top-3 right-2 sm:right-3">
            <span className="px-2 py-0.5 sm:px-3 sm:py-1 bg-white text-gray-900 text-[10px] sm:text-xs font-semibold border border-gray-300 rounded-full shadow-lg">
              7-Day Free Trial
            </span>
          </div>
        </div>

        {/* Content Section */}
        <div className="flex-1 p-3 sm:p-4 lg:p-6 flex flex-col">
          {/* Title */}
          <h3 className="text-base sm:text-lg lg:text-2xl font-bold text-gray-800 mb-1 sm:mb-2 group-hover:text-gray-900 transition-colors line-clamp-1">
            {software.name}
          </h3>

          {/* Description */}
          <p className="text-xs sm:text-sm text-gray-600 mb-2 sm:mb-4 line-clamp-2 flex-1">
            {software.description}
          </p>

          {/* Pricing Section */}
          <div className="space-y-2 sm:space-y-3 pt-2 sm:pt-4 border-t border-gray-100">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-baseline gap-1 sm:gap-2">
                <span className="text-sm sm:text-base lg:text-lg font-bold text-gray-700">
                  {formatPrice(software.mprice)}
                </span>
                <span className="text-xs sm:text-sm text-gray-500">/month</span>
              </div>
              {software.price && (
                <div className="flex items-baseline gap-1 sm:gap-2">                 
                   <span className="text-sm sm:text-base lg:text-lg font-bold text-gray-700">
                    {formatPrice(software.price)}
                    </span>
                    <span className="text-xs sm:text-sm text-gray-500">/year</span>
                </div>
              )}
            </div>

            {/* View Details Button */}
            <div className='pt-2 sm:pt-4'>
                <button
                  className="w-full py-1.5 sm:py-2 px-3 sm:px-4 text-white rounded-md bg-gray-800 text-xs sm:text-sm lg:text-base hover:bg-gray-700 transition-colors"
                >
                    View Details 
                    <svg className="inline-block w-3 h-3 sm:w-4 sm:h-4 ml-1 sm:ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
