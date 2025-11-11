"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Phone, MapPin, Mail, ChevronUp, ChevronDown } from "lucide-react";

import {
  FacebookIcon,
  InstagramIcon,
  TwitterIcon,
  YoutubeIcon,
  HeaderLogo,
} from "@/assets/Images";

export const Footer: React.FC = () => {
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [openSection, setOpenSection] = useState<string | null>(null);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleSection = (section: string) => {
    setOpenSection(openSection === section ? null : section);
  };

  const data = [
    {
      title: "Information",
      items: [
        "About Us",
        "Delivery Info",
        "Privacy Policy",
        "Terms & Conditions",
      ],
    },
    { title: "User Area", items: ["My Account", "Login"] },
    { title: "Guide & Help", items: ["Careers", "FAQs", "Contact Us"] },
  ];

  return (
    <footer className="bg-[#F8F8F8] py-10">
      <div className="max-w-screen-xl mx-auto w-full px-6 md:px-10">
      {/* Top Section */}
      <div
        className={`flex ${
          isMobile
            ? "flex-row justify-between items-start"
            : "flex-row justify-between items-start md:items-center mb-8"
        } `}
      >
        {/* Logo and Contact Information */}
        <div
          className={`flex flex-col mb-8 md:mb-0 w-1/2 ${
            isMobile ? "mb-[-15px]" : "mb-8"
          }`}
        >
          <Image
            src={HeaderLogo}
            alt="Autoonline Logo"
            className={`${
              isMobile ? "w-[51px] h-[43px]" : "w-[101px] h-[84px]"
            }`}
          />

          <p
            className={`text-gray-700 mt-4 ${
              isMobile ? "text-sm pl-1" : "text-base"
            }`}
          >
            {/* Phone */}
            <span className="flex items-center mb-2">
              <i className={` text-[#111102]  `}>
                <Phone className="md:w-[19px] md:h-[19px] w-[12px] h-[12px] " />
              </i>

              <span className="ml-[6px] md:ml-2 font-body text-[#5B5B5B] text-sm md:text-base">
                +94 7538 13398
              </span>
            </span>

            {/* Address */}
            <span className="flex items-center mb-2">
              <i
                className={` text-[#111102] w-[12px] h-[12px]${
                  isMobile ? "mt-[2px]" : "mb-2"
                }`}
              >
                <MapPin className="md:w-[19px] md:h-[19px] w-[14px] h-[14px]" />
              </i>
              <span className="ml-2 md:ml-4 font-body text-[#5B5B5B] text-sm md:text-base">
                No.20, 6th Lane, Araliya Uyana, Pannipitiya
              </span>
            </span>

            {/* Email */}
            <span className="flex items-center">
              <i
                className={` text-[#111102] w-[12px] h-[12px] ${
                  isMobile ? "mt-[4px] mb-[6px] " : "mb-[6px]"
                }`}
              >
                <Mail className="md:w-[19px] md:h-[19px] w-[14px] h-[14px]" />
              </i>
              <span className="ml-2 md:ml-4 font-body text-[#5B5B5B] text-sm md:text-base">
                info@autoonline.lk
              </span>
            </span>
          </p>
        </div>

        {/* Footer Links */}
        <div
          className={`grid ${
            isMobile
              ? "grid-cols-1 justify-end text-left mt-[55px] "
              : "grid-cols-1 md:grid-cols-3 w-full md:w-auto gap-x-[40px] mt-8"
          }`}
        >
          {data.map((section) => (
            <div key={section.title} className="text-left">
              <button
                onClick={() => toggleSection(section.title)}
                className={`w-full text-[#111102] flex items-center gap-2 ${
                  isMobile
                    ? "text-sm pr-2 font-body font-[600] text-left py-1"
                    : "text-base md:text-lg font-semibold py-2"
                }`}
              >
                {isMobile && (
                  <span>
                    {openSection === section.title ? (
                      // Arrow Up Icon
                      <ChevronUp size="15px" color="#111102" />
                    ) : (
                      // Arrow Down Icon
                      <ChevronDown size="15px" color="#111102" />
                    )}
                  </span>
                )}

                {/* Title aligned to the left of the arrow */}
                <span>{section.title}</span>
              </button>

              {/* Show Items Only on Larger Screens or when clicked on Mobile */}
              {!isMobile && (
                <ul className="mt-2 gap-8 text-sm md:text-base text-[#5B5B5B] space-y-2">
                  {section.items.map((item) => (
                    <li key={item}>
                      <a href="#" className="hover:text-gray-800">
                        {item}
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Dropdown Content for Mobile - Above Social Icons */}
      {isMobile && openSection && (
        <div className="mt-[20px]">
          <ul className="text-sm text-[#5B5B5B] space-y-1 justify-center text-center">
            {data
              .find((section) => section.title === openSection)
              ?.items.map((item) => (
                <li key={item}>
                  <a href="#" className="hover:text-gray-800">
                    {item}
                  </a>
                </li>
              ))}
          </ul>
        </div>
      )}

      {/* Social Media Icons */}
      <div
        className={`flex ${
          isMobile ? "justify-center mt-6 mb-1" : "justify-start mt-2 "
        } space-x-4`}
      >
        <a href="#" className="text-gray-500 hover:text-gray-800">
          <FacebookIcon />
        </a>
        <a href="#" className="text-gray-500 hover:text-gray-800">
          <InstagramIcon />
        </a>
        <a href="#" className="text-gray-500 hover:text-gray-800">
          <YoutubeIcon />
        </a>
        <a href="#" className="text-gray-500 hover:text-gray-800">
          <TwitterIcon />
        </a>
      </div>

      {/* Footer Bottom Section */}
      <div
        className={`flex flex-col md:flex-row items-center ${
          isMobile ? "text-sm pt-2" : "text-sm pt-10"
        } text-[#5B5B5B] w-full`}
      >
        {/* Empty space for alignment on larger screens */}
        <div className={`hidden md:flex md:w-1/3`}></div>

        {/* Centered Copyright */}
        <div
          className={`text-center ${
            isMobile ? "order-2 mt-2 w-full" : "order-none md:w-1/3"
          }`}
        >
          <p>
            Copyright © 2024 <span className="text-[#930000]">Autoonline</span>.
            All Rights Reserved.
          </p>
        </div>

        {/* Footer Links - Right aligned on larger screens */}
        <div
          className={`flex ${
            isMobile
              ? "order-1 justify-center w-full"
              : "order-none justify-end md:w-1/3"
          } space-x-4 text-sm`}
        >
          <a href="#" className="hover:text-gray-800">
            Website use policy
          </a>
          <a href="#" className="hover:text-gray-800">
            Careers
          </a>
          <a href="#" className="hover:text-gray-800">
            Sitemap
          </a>
        </div>
      </div>
      </div>
    </footer>
  );
};
