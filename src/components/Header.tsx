"use client";

import React, { useState, useRef } from "react";
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
  User,
} from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { HeaderLogo } from "@/assets/Images";
import { RootState } from "@/app/store/store";
import { logoutUserAsync } from "@/app/store/slice/authslice";
import { useFirebase } from "@/contexts/FirebaseContext";

export const Header: React.FC = () => {
  const [activeSection, setActiveSection] = useState<string>("");
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [isUserModalOpen, setIsUserModalOpen] = useState<boolean>(false);
  const userButtonRef = useRef<HTMLButtonElement>(null);
  const [modalPosition, setModalPosition] = useState({ top: 0, right: 0 });

  const data = [
    { name: "home", path: "/#home", icon: LayoutGrid },
    { name: "services", path: "/#services", icon: UsersRound },
    { name: "about", path: "/#about", icon: History },
    { name: "contact", path: "/#contact", icon: CircleHelp },
  ];

  const { isAuthenticated, user, loading } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const { initialized } = useFirebase();

  const handleLogout = () => {
    dispatch(logoutUserAsync() as any);
    setIsUserModalOpen(false);
  };

  const handleUserModalToggle = () => {
    if (userButtonRef.current) {
      const rect = userButtonRef.current.getBoundingClientRect();
      setModalPosition({
        top: rect.bottom + window.scrollY + 10,
        right: window.innerWidth - rect.right,
      });
    }
    setIsUserModalOpen(!isUserModalOpen);
  };

  return (
    <>
      {/* Header */}
      <header className="flex justify-between items-center p-4 bg-white relative max-w-screen-xl mx-auto w-full">
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

          {/* Conditional Rendering for Small Screens */}
          {isAuthenticated ? (
            <button
              ref={userButtonRef}
              onClick={handleUserModalToggle}
              className="absolute right-0 flex items-center justify-center w-[24px] h-[24px]"
            >
              <User size="18px" color="#111102" />
            </button>
          ) : initialized && !loading ? (
            <Link
              href="/user/login"
              className="absolute right-0 w-[70px] h-[24px] bg-[#F9C301] text-black rounded-[3px] text-[12px] font-semibold hover:bg-yellow-500 flex items-center justify-center"
            >
              LOGIN
            </Link>
          ) : (
            <div className="absolute right-0 w-[70px] h-[24px]" />
          )}
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

        {/* Conditional Rendering for Larger Screens */}
        {isAuthenticated ? (
          <div className="hidden md:flex items-center relative">
            <button
              ref={userButtonRef}
              onClick={handleUserModalToggle}
              className="flex items-center mr-[30px]"
            >
              <User size="24px" color="#111102" />
            </button>
          </div>
        ) : initialized && !loading ? (
          <div className="hidden md:block">
            <Link
              href="/user/login"
              className="px-[30px] py-[10px] bg-[#F9C301] text-black rounded-md font-body font-[700] hover:bg-yellow-500 w-[120px] h-[42px] text-[16px] mr-[30px] flex items-center justify-center"
            >
              LOGIN
            </Link>
          </div>
        ) : (
          <div className="hidden md:block w-[120px] h-[42px] mr-[30px]" />
        )}

        {/* User Pop-up Menu positioned below the icon */}
        {isUserModalOpen && (
          <div 
            className="fixed z-50 bg-white rounded-lg shadow-lg w-[200px] border border-gray-200"
            style={{
              top: `${modalPosition.top}px`,
              right: `${modalPosition.right}px`,
            }}
          >
            <div className="p-4">
              <div className="flex justify-center mb-4">
                <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center">
                  <User className="text-black" size={24} />
                </div>
              </div>
              <div className="space-y-2">
                <Link
                  href="/user/profile"
                  className="block w-full text-left px-4 py-2 bg-white border border-gray-300 rounded hover:bg-gray-100 text-black text-sm"
                  onClick={() => setIsUserModalOpen(false)}
                >
                  My Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-2 bg-white border border-gray-300 rounded hover:bg-gray-100 text-black text-sm"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        )}
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
      <div className="hidden md:flex w-full bg-black justify-center items-center">
        <div className="flex space-x-2 max-w-screen-xl mx-auto w-full justify-center h-[42px]">
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