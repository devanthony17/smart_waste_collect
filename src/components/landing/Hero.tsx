import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function Hero() {
  const { t } = useTranslation();

  const slides = [
    {
      title: t("hero_title"), 
      desc: t("hero_desc"),
      image: "/images/ghana_sanitation.png",
    },
    {
      title: t("slider_2_title", "Tackling Urban Flooding"),
      desc: t("slider_2_desc", "Prevent blocked drainages and devastating floods in cities like Accra through responsible waste disposal."),
      image: "/images/accra_flood.png",
    },
    {
      title: t("slider_3_title", "Cleaner, Greener Ghana"),
      desc: t("slider_3_desc", "Join us in creating beautiful, sustainable, and smart neighborhoods across the nation."),
      image: "/images/ghana_clean_street.png",
    },
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, 6000); // 6 seconds for better reading
    return () => clearInterval(timer);
  }, [slides.length]);

  const nextSlide = () => setCurrentIndex((prev) => (prev + 1) % slides.length);
  const prevSlide = () => setCurrentIndex((prev) => (prev === 0 ? slides.length - 1 : prev - 1));

  return (
    <>
      {/* Background Image Slider */}
      <div className="absolute inset-0 z-0">
        <AnimatePresence mode="popLayout">
          <motion.img
            key={currentIndex}
            src={slides[currentIndex].image}
            alt="Hero Background"
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
            className="absolute inset-0 w-full h-full object-cover"
          />
        </AnimatePresence>
        {/* Dark gradient overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-black/30 z-10" />
      </div>

      {/* Foreground Content Slider */}
      <div className="relative w-full overflow-visible min-h-[300px] flex items-center justify-center pt-20 z-20">
        <div className="text-center max-w-4xl mx-auto px-12 relative min-h-[200px] flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="w-full"
            >
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold leading-tight text-white drop-shadow-xl">
                {slides[currentIndex].title}
              </h1>
              <p className="mt-6 text-lg md:text-2xl text-gray-200 drop-shadow-lg font-medium">
                {slides[currentIndex].desc}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation Arrows */}
        <button 
          onClick={prevSlide}
          className="absolute left-4 top-1/2 -translate-y-1/2 p-4 rounded-full bg-black/20 hover:bg-black/40 border border-white/20 text-white backdrop-blur-md transition-all hidden md:flex items-center justify-center shadow-2xl hover:scale-110"
        >
          <ChevronLeft className="w-8 h-8" />
        </button>
        <button 
          onClick={nextSlide}
          className="absolute right-4 top-1/2 -translate-y-1/2 p-4 rounded-full bg-black/20 hover:bg-black/40 border border-white/20 text-white backdrop-blur-md transition-all hidden md:flex items-center justify-center shadow-2xl hover:scale-110"
        >
          <ChevronRight className="w-8 h-8" />
        </button>

        {/* Dots */}
        <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 flex gap-3 z-30">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`h-3 rounded-full transition-all duration-500 shadow-lg ${
                currentIndex === idx ? "bg-primary-500 w-10" : "bg-white/50 hover:bg-white/90 w-3"
              }`}
            />
          ))}
        </div>
      </div>
    </>
  );
}