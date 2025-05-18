"use client";

import React, { useEffect, useState } from "react";

export const ScrollToTopButton: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 200) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const scrollToHome = () => {
    const homeSection = document.getElementById("home");
    if (homeSection) {
      homeSection.scrollIntoView({ behavior: "smooth" });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <>
      {isVisible && (
        <button
          onClick={scrollToHome}
          className="hidden md:flex fixed md:bottom-4 md:right-4 bottom-2 right-2 z-50 bg-[#F9C301] hover:bg-yellow-500 text-[#111102] font-body font-bold md:py-2 md:px-4 py-1 px-2 md:text-sm text-[12px]  rounded-full shadow-lg transition-all"
          title="Scroll to Home"
        >
          ⬆ Home
        </button>
      )}
    </>
  );
};
