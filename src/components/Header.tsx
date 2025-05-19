"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Search,
  CirclePlus,
  LayoutGrid,
  History,
  CircleHelp,
  UsersRound,
  AlignLeft,
} from "lucide-react";

import { HeaderLogo } from "@/assets/Images";

export const Header: React.FC = () => {
  const [activeSection, setActiveSection] = useState<string>("");
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const data = [
    { name: "home", path: "/#home", icon: LayoutGrid },
    { name: "services", path: "/#services", icon: UsersRound },
    { name: "about", path: "/#about", icon: History },
    { name: "contact", path: "/#contact", icon: CircleHelp },
  ];

  return (
    <>
      {/* Header */}
      <header className="flex justify-between items-center p-4 bg-white shadow-md">
        {/* Logo - Hidden on Small Screens */}
        <div className="hidden md:flex items-center">
          <Image
            src={HeaderLogo}
            alt="Autonline Logo"
            className="h-[76px] w-[91px] ml-[42px]"
          />
        </div>

        {/* Flex Container for Small Screens */}
        <div className="md:hidden flex items-center w-full relative pt-10">
          {/* Hamburger Menu Icon (Left) */}
          <button
            onClick={() => setIsMenuOpen(true)}
            className="text-gray-600 hover:text-black focus:outline-none"
          >
            <AlignLeft size="18px" color="#111102" />
          </button>

          {/* Small Login Button (Right Corner) */}
          <Link
            href="/#login"
            className="absolute right-0 w-[70px] h-[24px] bg-[#F9C301] text-black rounded-[3px] text-[12px] font-semibold hover:bg-yellow-500 flex items-center justify-center"
          >
            LOGIN
          </Link>
        </div>

        {/* Search Bar - Hidden on Small Screens */}
        <div className="hidden md:flex items-center w-[523px] h-[42px] border border-gray-300 rounded-[50px] overflow-hidden">
          <input
            type="text"
            className="flex-grow px-4 py-2 text-gray-700 focus:outline-none"
            placeholder="Search..."
          />
          <button className="flex items-center justify-center w-[88px] h-full bg-[#F9C301] hover:bg-yellow-500">
            <Search color="#111102" />
          </button>
        </div>

        {/* Login Button - Hidden on Small Screens */}
        <div className="hidden md:block">
          <Link
            href="/#login"
            className="px-[30px] py-[10px] bg-[#F9C301] text-black rounded-md font-body font-[700] hover:bg-yellow-500 w-[120px] h-[42px] text-[16px] mr-[30px] flex items-center justify-center"
          >
            LOGIN
          </Link>
        </div>
      </header>

      {/* Search Bar for Small Screens */}
      <div className="md:hidden p-4 bg-white flex justify-center">
        <div className="flex items-center w-[328px] h-[28px] border border-gray-300 rounded-[25px] overflow-hidden">
          <input
            type="text"
            className="flex-grow px-3 py-1 text-gray-700 focus:outline-none text-[12px]"
            placeholder="Search..."
          />
          <button className="flex items-center justify-center w-[50px] h-full bg-[#F9C301] hover:bg-yellow-500">
            <Search size="16px" color="#111102" />
          </button>
        </div>
      </div>

      {/* Black Bar Section with Links */}
      <div className="hidden md:flex w-full h-[42px] bg-black justify-center items-center">
        <div className="flex space-x-2">
          {data.map(({ name }) => (
            <Link
              key={name}
              href={`/#${name}`}
              className={`text-[16px] font-body w-[127px] h-[42px] flex items-center justify-center ${
                activeSection === name
                  ? "bg-yellow-500 text-black"
                  : "text-white hover:text-black hover:bg-yellow-500"
              }`}
              onClick={() => setActiveSection(name)}
            >
              {name.charAt(0).toUpperCase() + name.slice(1)}
            </Link>
          ))}
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div className="w-[230px] bg-[#F8F8F8] shadow-md p-6 h-full relative pt-10">
            {/* Close Button */}
            <button
              onClick={() => setIsMenuOpen(false)}
              className="absolute top-4 right-4 text-gray-600 hover:text-black rotate-45"
            >
              <CirclePlus
                strokeWidth="1px"
                className="text-[#111102] hover:text-[#F9C301]"
              />
            </button>

            {/* Navigation Links */}
            <nav className="mt-8 space-y-4">
              {data.map(({ name, path, icon: Icon }) => (
                <Link
                  key={name}
                  href={path}
                  className={`w-full flex items-center gap-2 text-[14px] py-2 px-4 rounded-[4px] ${
                    activeSection === name
                      ? "bg-[#FEFEFE] text-[#F9C301]"
                      : "text-[#111102] hover:bg-[#FEFEFE] hover:text-[#F9C301]"
                  }`}
                  onClick={() => {
                    setActiveSection(name);
                    setIsMenuOpen(false);
                  }}
                >
                  <Icon size="22px" />
                  {name.charAt(0).toUpperCase() + name.slice(1)}
                </Link>
              ))}
            </nav>
          </div>

          {/* Right Overlay */}
          <div
            className="flex-1 bg-black bg-opacity-40"
            onClick={() => setIsMenuOpen(false)}
          />
        </div>
      )}
    </>
  );
};
