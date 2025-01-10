import React from "react";
import Image from "next/image";
import HeaderLogo from "@/assets/HeaderLogo.png";

const Header: React.FC = () => {
  return (
    <>
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
        <div className="flex items-center w-[523px] h-[42px] border border-[#D1D1D1] rounded-[50px] overflow-hidden">
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
          <button className="px-[30px] py-[10px] bg-[#F9C301] text-black rounded-md font-body font-[700] hover:bg-yellow-500 w-[120px] h-[42px] text-[16px] mr-[30px]">
            LOGIN
          </button>
        </div>
      </header>

      {/* Black Bar Section with Links */}
      <div className="w-full h-[42px] bg-black flex justify-center items-center">
        <div className="flex space-x-4">
          <a
            href="#home"
            className="text-white text-[16px] font-body hover:text-black hover:bg-[#F9C301] w-[127px] h-[42px] flex items-center justify-center"
          >
            Home
          </a>
          <a
            href="#services"
            className="text-white text-[16px] font-body hover:text-black hover:bg-[#F9C301] w-[127px] h-[42px] flex items-center justify-center"
          >
            Services
          </a>
          <a
            href="#about"
            className="text-white text-[16px] font-body hover:text-black hover:bg-[#F9C301] w-[127px] h-[42px] flex items-center justify-center"
          >
            About Us
          </a>
          <a
            href="#contact"
            className="text-white text-[16px] font-body hover:text-black hover:bg-[#F9C301] w-[127px] h-[42px] flex items-center justify-center"
          >
            Contact Us
          </a>
        </div>
      </div>
    </>
  );
};

export default Header;
