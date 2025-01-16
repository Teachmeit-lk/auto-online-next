"use client";

import React, { useEffect, useState } from "react";

const ScrollToTopButton: React.FC = () => {
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
          className="fixed bottom-4 right-4 z-50 bg-[#F9C301] hover:bg-yellow-500 text-black font-body font-bold py-2 px-4 rounded-full shadow-lg transition-all"
          title="Scroll to Home"
        >
          ⬆ Home
        </button>
      )}
    </>
  );
};

export default ScrollToTopButton;
