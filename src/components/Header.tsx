"use client";

import React, { Suspense, useEffect, useState } from "react";
import Image from "next/image";
import HeaderLogo from "@/assets/HeaderLogo.png";
import { useRouter, useSearchParams } from "next/navigation";
import { usePathname } from "next/navigation";

const Header: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [activeSection, setActiveSection] = useState<string>("");

  useEffect(() => {
    const targetSection = searchParams.get("scrollTo");
    if (pathname === "/" && targetSection) {
      const section = document.getElementById(targetSection);
      if (section) {
        section.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, [pathname, searchParams]);

  const handleLoginClick = () => {
    setActiveSection("");
    router.push("/login");
  };

  const handleNavigation = (section: string) => {
    if (pathname === "/") {
      scrollToSection(section);
    } else {
      router.push(`/?scrollTo=${section}`);
    }
  };

  const scrollToSection = (id: string) => {
    const section = document.getElementById(id);
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    if (pathname !== "/") {
      setActiveSection("");
      return;
    }

    const sections = ["home", "services", "about", "contact"];
    const observerOptions = {
      root: null,
      rootMargin: "0px",
      threshold: 0.6,
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    }, observerOptions);

    sections.forEach((id) => {
      const section = document.getElementById(id);
      if (section) {
        observer.observe(section);
      }
    });

    return () => {
      sections.forEach((id) => {
        const section = document.getElementById(id);
        if (section) {
          observer.unobserve(section);
        }
      });
    };
  }, [pathname]);

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <header className="flex justify-between items-center p-4 bg-white shadow-md">
        {/* Logo Section */}
        <div className="flex items-center">
          <Image
            src={HeaderLogo}
            alt="Autonline Logo"
            className="h-[76px] w-[91px] ml-[42px] "
          />
        </div>

        {/* Search Bar */}
        <div className="flex items-center w-[523px] h-[42px] border border-gray-300 rounded-[50px] overflow-hidden">
          <input
            type="text"
            className="flex-grow px-4 py-2 text-gray-700 focus:outline-none"
            placeholder="Search..."
          />
          <button className="flex items-center justify-center w-[88px] h-full bg-[#F9C301] hover:bg-yellow-500">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-black"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </button>
        </div>

        {/* Login Button */}
        <div>
          <button
            onClick={handleLoginClick}
            className="px-[30px] py-[10px] bg-[#F9C301] text-black rounded-md font-body font-[700] hover:bg-yellow-500 w-[120px] h-[42px] text-[16px] mr-[30px]"
          >
            LOGIN
          </button>
        </div>
      </header>

      {/* Black Bar Section with Links */}
      <div className="w-full h-[42px] bg-black flex justify-center items-center">
        <div className="flex space-x-2">
          {["home", "services", "about", "contact"].map((section) => (
            <button
              key={section}
              onClick={() => handleNavigation(section)}
              className={`text-[16px] font-body w-[127px] h-[42px] flex items-center justify-center ${
                activeSection === section
                  ? "bg-yellow-500 text-black"
                  : "text-white hover:text-black hover:bg-yellow-500"
              }`}
            >
              {section.charAt(0).toUpperCase() + section.slice(1)}
            </button>
          ))}
        </div>
      </div>
    </Suspense>
  );
};

export default Header;
