'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import RepublicHeader from '@/components/RepublicHeader';
import RepublicFooter from '@/components/RepublicFooter';


export default function LandingPage({ userName = '' }) {
  const [activeSlide, setActiveSlide] = useState(0);

  // Republican Day Banner data
  const banners = [
    {
      id: 3,
      title: 'SPECIAL OFFER 🎯',
      subtitle: 'EXCLUSIVE DEALS',
      description: 'LIMITED TIME PROMOTION',
      isImageBanner: true,
      imageSrc: '/images/banner3.jpeg',
      imageAlt: 'Special Promotion Banner',
    },
    {
      id: 1,
      title: 'REPUBLIC DAY SPECIAL 🇮🇳',
      subtitle: 'SALES DOST SALUTES',
      description: 'CELEBRATE WITH SUPER INCENTIVES',
      highlights: [
        '🪁 Special 26th Jan Rewards',
        '🇮🇳 Earn Extra on every Sale',
      ],
      validity: 'Valid till 31st Jan',
      isImageBanner: true,
      imageSrc: '/images/banner1.jpeg',
      imageAlt: 'Republic Day Banner 1',
      showTextOverlay: true,
    },
    {
      id: 2,
      title: 'PITCH SULTAN',
      subtitle: 'SPECIAL PROMOTION',
      description: 'EXCLUSIVE OFFER',
      isImageBanner: true,
      imageSrc: '/pitchsultan_banner.png',
      imageAlt: 'Pitch Sultan Banner',
      link: 'https://www.salesdost.com/pitchsultan/rewards',
    },
  ];

  // Auto-scroll banner every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % banners.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [banners.length]);

  // Feature tiles data
  const features = [
    {
      id: 'sec-incentive',
      title: 'SEC Incentive Form',
      description: 'Submit your sales IMEI wise',
      icon: '📝',
      bgGradient: 'from-[#2563eb] via-[#3b82f6] to-[#06b6d4]',
      iconBg: 'bg-white/20',
      link: '/SEC/incentive-form',
      badge: 'SUBMIT ⚡'
    },
    {
      id: 'ranking',
      title: 'Battle Standings',
      description: 'View Your Progress',
      icon: '⚔️',
      bgGradient: 'from-[#6366f1] via-[#8b5cf6] to-[#ec4899]',
      iconBg: 'bg-white/20',
      link: '/SEC/republic-day-hero',
      badge: 'LIVE 🔴'
    },
    {
      id: 'claim-raise',
      title: 'SC+ Claim Raise Procedure',
      description: 'Learn More',
      icon: '📢',
      bgGradient: 'from-[#ea580c] via-[#f97316] to-[#fbbf24]',
      iconBg: 'bg-white/20',
      link: '/SEC/claim-procedure',
      badge: 'GUIDE 📘'
    },
    {
      id: 'regiments',
      title: 'Regiments',
      description: 'View Your Regiment',
      icon: '🎖️',
      bgGradient: 'from-[#166534] via-[#15803d] to-[#4ade80]',
      iconBg: 'bg-white/20',
      link: '/SEC/republic-regiments',
      badge: 'YOUR SQUAD 🪖'
    },
  ];

  const handleSlideChange = (index) => {
    setActiveSlide(index);
  };

  return (
    <div className="min-h-screen md:h-auto h-screen bg-gray-50 flex flex-col md:overflow-visible overflow-hidden">
      <RepublicHeader userName={userName || 'Guest'} />

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden pb-32">

        {/* Banner Carousel */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12 mb-4 sm:mb-5 md:mb-6 pt-4">
          <div className="relative overflow-hidden rounded-xl md:rounded-2xl shadow-lg h-[200px] sm:h-[220px] md:h-[260px] lg:h-[300px]">
            <div
              className="flex transition-transform duration-500 ease-in-out h-full"
              style={{ transform: `translateX(-${activeSlide * 100}%)` }}
            >
              {banners.map((banner) => (
                <div
                  key={banner.id}
                  className="w-full flex-shrink-0 h-full"
                >
                  {banner.isImageBanner ? (
                    // Image Banner - Clickable
                    <a
                      href={banner.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full h-full relative overflow-hidden rounded-xl md:rounded-2xl bg-gray-100 block cursor-pointer hover:opacity-90 transition-opacity"
                    >
                      <img
                        src={banner.imageSrc}
                        alt={banner.imageAlt}
                        className="w-full h-full object-cover object-top"
                      />

                      {/* Text Overlay for banners with showTextOverlay flag */}
                      {banner.showTextOverlay && (
                        <div className="absolute inset-0 flex flex-col justify-center items-center text-center px-4 sm:px-6 md:px-8">
                          <p className="text-[10px] sm:text-xs md:text-sm font-bold mb-0.5 sm:mb-1 uppercase tracking-wider text-gray-900">
                            {banner.title}
                          </p>
                          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-extrabold mb-0.5 sm:mb-1 md:mb-2 text-gray-900">
                            {banner.subtitle}
                          </h2>
                          <p className="text-[10px] sm:text-xs md:text-sm font-semibold mb-2 sm:mb-3 md:mb-4 text-gray-800">
                            {banner.description}
                          </p>
                          <div className="space-y-1.5 sm:space-y-2 md:space-y-2.5 w-full max-w-[280px] sm:max-w-[320px] md:max-w-[400px] lg:max-w-[500px]">
                            {banner.highlights && banner.highlights.map((highlight, idx) => (
                              <div
                                key={idx}
                                className="bg-white/95 rounded-full px-3 sm:px-4 md:px-5 py-1.5 sm:py-2 md:py-2.5 text-[10px] sm:text-xs md:text-sm font-bold text-gray-900 shadow-sm"
                              >
                                {highlight}
                              </div>
                            ))}
                          </div>
                          {banner.validity && (
                            <p className="text-[9px] sm:text-[10px] md:text-xs font-medium mt-2 sm:mt-3 md:mt-4 text-gray-800">
                              {banner.validity}
                            </p>
                          )}
                        </div>
                      )}
                    </a>
                  ) : (
                    // Gradient Banner
                    <div
                      className={`bg-gradient-to-br ${banner.gradient} px-4 sm:px-6 md:px-8 py-4 sm:py-5 md:py-6 lg:py-8 h-full flex flex-col justify-center items-center text-center relative overflow-hidden`}
                    >
                      {/* Watermark/Background decoration */}
                      <div className="absolute inset-0 opacity-10 flex items-center justify-center pointer-events-none">
                        <span className="text-[150px]">🇮🇳</span>
                      </div>

                      <p className={`text-[10px] sm:text-xs md:text-sm font-bold mb-0.5 sm:mb-1 uppercase tracking-wider ${banner.textColor || 'text-gray-900'}`}>
                        {banner.title}
                      </p>
                      <h2 className={`text-xl sm:text-2xl md:text-3xl lg:text-4xl font-extrabold mb-0.5 sm:mb-1 md:mb-2 ${banner.textColor || 'text-gray-900'}`}>
                        {banner.subtitle}
                      </h2>
                      <p className={`text-[10px] sm:text-xs md:text-sm font-semibold mb-2 sm:mb-3 md:mb-4 ${banner.textColor || 'text-gray-800'}`}>
                        {banner.description}
                      </p>
                      <div className="space-y-1.5 sm:space-y-2 md:space-y-2.5 w-full max-w-[280px] sm:max-w-[320px] md:max-w-[400px] lg:max-w-[500px] relative z-10">
                        {banner.highlights.map((highlight, idx) => (
                          <div
                            key={idx}
                            className="bg-white/95 rounded-full px-3 sm:px-4 md:px-5 py-1.5 sm:py-2 md:py-2.5 text-[10px] sm:text-xs md:text-sm font-bold text-gray-900 shadow-sm"
                          >
                            {highlight}
                          </div>
                        ))}
                      </div>
                      <p className={`text-[9px] sm:text-[10px] md:text-xs font-medium mt-2 sm:mt-3 md:mt-4 opacity-80 ${banner.textColor || 'text-gray-800'}`}>
                        {banner.validity}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Dots Indicator - Tricolor */}
          <div className="flex justify-center gap-1.5 sm:gap-2 mt-2.5 sm:mt-3 md:mt-4">
            {banners.map((_, index) => (
              <button
                key={index}
                onClick={() => handleSlideChange(index)}
                className={`h-1.5 sm:h-2 md:h-2.5 rounded-full transition-all duration-300 ${activeSlide === index
                  ? 'w-6 sm:w-8 md:w-10'
                  : 'w-1.5 sm:w-2 md:w-2.5 bg-gray-300'
                  }`}
                style={{
                  backgroundColor: activeSlide === index
                    ? (index === 0 ? '#FF9933' : index === 1 ? '#000080' : '#FFD700')
                    : undefined
                }}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Feature Tiles */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5 lg:gap-6 mb-4">
          {features.map((feature) => (
            <Link
              key={feature.id}
              href={feature.link}
              className="block group"
            >
              <div
                className={`bg-gradient-to-br ${feature.bgGradient} rounded-2xl md:rounded-3xl p-3.5 sm:p-4 md:p-5 min-h-[140px] sm:min-h-[155px] md:min-h-[180px] lg:min-h-[200px] flex flex-col justify-between relative overflow-hidden transition-transform duration-300 group-hover:scale-105 group-hover:shadow-xl`}
              >
                {/* Icon */}
                <div className={`${feature.iconBg} w-9 h-9 sm:w-10 sm:h-10 md:w-12 md:h-12 lg:w-14 lg:h-14 rounded-xl md:rounded-2xl flex items-center justify-center text-lg sm:text-xl md:text-2xl lg:text-3xl transition-transform group-hover:scale-110`}>
                  {feature.icon}
                </div>

                {/* Badge if present */}
                {feature.badge && (
                  <div className="absolute top-3 right-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-full px-2 py-0.5 text-[8px] sm:text-[10px] font-bold text-white shadow-sm animate-pulse">
                    {feature.badge}
                  </div>
                )}

                {/* Content */}
                <div className="flex-1 mt-2 sm:mt-3 md:mt-4">
                  <h3 className="text-white font-bold text-sm sm:text-base md:text-lg lg:text-xl mb-0.5 sm:mb-1 leading-tight">
                    {feature.title}
                  </h3>
                  <p className="text-white/95 text-[10px] sm:text-xs md:text-sm">
                    {feature.description}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </main>

      <RepublicFooter />
    </div>
  );
}
