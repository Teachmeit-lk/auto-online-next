"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import HeaderLogo from "@/assets/HeaderLogo.png";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Cross2Icon } from "@radix-ui/react-icons";

const Header: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [activeSection, setActiveSection] = useState<string>("");
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);

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
    setIsMenuOpen(false);
  };

  const scrollToSection = (id: string) => {
    const section = document.getElementById(id);
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    }
  };

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
            <svg
              width="14"
              height="18"
              viewBox="0 0 14 12"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M0.25 0H13.75V1.5H0.25V0ZM0.25 5.25H9.25V6.75H0.25V5.25ZM0.25 10.5H13.75V12H0.25V10.5Z"
                fill="#111102"
              />
            </svg>
          </button>

          {/* Small Login Button (Right Corner) */}
          <button
            onClick={handleLoginClick}
            className="absolute right-0 w-[70px] h-[24px] bg-[#F9C301] text-black rounded-[3px] text-[12px] font-semibold hover:bg-yellow-500"
          >
            LOGIN
          </button>
        </div>

        {/* Search Bar - Hidden on Small Screens */}
        <div className="hidden md:flex items-center w-[523px] h-[42px] border border-gray-300 rounded-[50px] overflow-hidden">
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

        {/* Login Button - Hidden on Small Screens */}
        <div className="hidden md:block">
          <button
            onClick={handleLoginClick}
            className="px-[30px] py-[10px] bg-[#F9C301] text-black rounded-md font-body font-[700] hover:bg-yellow-500 w-[120px] h-[42px] text-[16px] mr-[30px]"
          >
            LOGIN
          </button>
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
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 text-black"
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
      </div>

      {/* Black Bar Section with Links */}
      <div className="hidden md:flex w-full h-[42px] bg-black justify-center items-center">
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

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div className="w-[230px] bg-[#F8F8F8] shadow-md p-6 h-full relative pt-10">
            {/* Close Button */}
            <button
              onClick={() => setIsMenuOpen(false)}
              className="absolute top-4 right-4 text-gray-600 hover:text-black"
            >
              <Cross2Icon />
            </button>

            {/* Navigation Links with SVG Icons */}
            <nav className="mt-8 space-y-4">
              {/* Home Button */}
              <button
                onClick={() => handleNavigation("home")}
                className={`w-full flex items-center gap-2 text-center font-sebino text-[14px] py-2 px-4 rounded-[4px] ${
                  activeSection === "home"
                    ? "bg-[#FEFEFE] text-[#F9C301]"
                    : "text-[#111102] hover:bg-[#FEFEFE] hover:text-[#F9C301]"
                }`}
              >
                {/* Home Icon */}
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 18 18"
                  fill="currentColor"
                  xmlns="http://www.w3.org/2000/svg"
                  className="mr-[10px]"
                >
                  <path d="M10 6V0H18V6H10ZM0 10V0H8V10H0ZM10 18V8H18V18H10ZM0 18V12H8V18H0ZM2 8H6V2H2V8ZM12 16H16V10H12V16ZM12 4H16V2H12V4ZM2 16H6V14H2V16Z" />
                </svg>
                Home
              </button>

              {/* Services Button */}
              <button
                onClick={() => handleNavigation("services")}
                className={`w-full flex items-center gap-2 text-left text-[14px] py-2 px-4 rounded-[4px] ${
                  activeSection === "services"
                    ? "bg-[#FEFEFE] text-[#F9C301]"
                    : "text-[#111102] hover:bg-[#FEFEFE] hover:text-[#F9C301]"
                }`}
              >
                {/* Services Icon */}
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  xmlns="http://www.w3.org/2000/svg"
                  className="mr-2"
                >
                  <path d="M18.75 3.75V2.5H16.875V1.25H15.625V2.5H15C14.3106 2.5 13.75 3.06125 13.75 3.75V5C13.75 5.68937 14.3106 6.25 15 6.25H17.5V7.5H13.75V8.75H15.625V10H16.875V8.75H17.5C18.1894 8.75 18.75 8.18937 18.75 7.5V6.25C18.75 5.56125 18.1894 5 17.5 5H15V3.75H18.75ZM15 12.5V13.75H16.6163L14.375 15.9913L12.9425 14.5581C12.8255 14.4411 12.6668 14.3752 12.5013 14.375H12.5C12.3345 14.3752 12.1758 14.4411 12.0588 14.5581L8.75 17.8663L9.63375 18.75L12.5006 15.8837L13.9331 17.3169C14.0503 17.434 14.2093 17.4999 14.375 17.4999C14.5407 17.4999 14.6997 17.434 14.8169 17.3169L17.5 14.6337V16.25H18.75V12.5H15ZM2.5 18.75H1.25V15.625C1.25 13.2125 3.2125 11.25 5.625 11.25H9.375C10.6181 11.25 11.8062 11.7812 12.6356 12.7081L11.7044 13.5419C11.4113 13.2141 11.0523 12.9519 10.6509 12.7723C10.2495 12.5928 9.81472 12.5 9.375 12.5H5.625C3.90188 12.5 2.5 13.9019 2.5 15.625V18.75ZM7.5 10C8.66032 10 9.77312 9.53906 10.5936 8.71859C11.4141 7.89812 11.875 6.78532 11.875 5.625C11.875 4.46468 11.4141 3.35188 10.5936 2.53141C9.77312 1.71094 8.66032 1.25 7.5 1.25C6.33968 1.25 5.22688 1.71094 4.40641 2.53141C3.58594 3.35188 3.125 4.46468 3.125 5.625C3.125 6.78532 3.58594 7.89812 4.40641 8.71859C5.22688 9.53906 6.33968 10 7.5 10ZM7.5 2.5C8.3288 2.5 9.12366 2.82924 9.70971 3.41529C10.2958 4.00134 10.625 4.7962 10.625 5.625C10.625 6.4538 10.2958 7.24866 9.70971 7.83471C9.12366 8.42076 8.3288 8.75 7.5 8.75C6.6712 8.75 5.87634 8.42076 5.29029 7.83471C4.70424 7.24866 4.375 6.4538 4.375 5.625C4.375 4.7962 4.70424 4.00134 5.29029 3.41529C5.87634 2.82924 6.6712 2.5 7.5 2.5Z" />
                </svg>
                Services
              </button>

              {/* About Button */}
              <button
                onClick={() => handleNavigation("about")}
                className={`w-full flex items-center gap-2 text-left text-[14px] py-2 px-4 rounded-[4px] ${
                  activeSection === "about"
                    ? "bg-[#FEFEFE] text-[#F9C301]"
                    : "text-[#111102] hover:bg-[#FEFEFE] hover:text-[#F9C301]"
                }`}
              >
                {/* About Icon */}
                <svg
                  width="21"
                  height="18"
                  viewBox="0 0 21 18"
                  fill="currentColor"
                  xmlns="http://www.w3.org/2000/svg"
                  className="mr-2"
                >
                  <path d="M11.9166 0.75C9.72859 0.75 7.63017 1.61919 6.08299 3.16637C4.53582 4.71354 3.66663 6.81196 3.66663 9H0.916626L4.48246 12.5658L4.54663 12.6942L8.24996 9H5.49996C5.49996 5.4525 8.36913 2.58333 11.9166 2.58333C15.4641 2.58333 18.3333 5.4525 18.3333 9C18.3333 12.5475 15.4641 15.4167 11.9166 15.4167C10.1475 15.4167 8.54329 14.6925 7.38829 13.5283L6.08663 14.83C6.85047 15.5983 7.75893 16.2078 8.75957 16.6231C9.76021 17.0385 10.8332 17.2516 11.9166 17.25C14.1047 17.25 16.2031 16.3808 17.7503 14.8336C19.2974 13.2865 20.1666 11.188 20.1666 9C20.1666 6.81196 19.2974 4.71354 17.7503 3.16637C16.2031 1.61919 14.1047 0.75 11.9166 0.75ZM11 5.33333V9.91667L14.9233 12.245L15.5833 11.1358L12.375 9.22917V5.33333H11Z" />
                </svg>
                About
              </button>

              {/* Contact Button */}
              <button
                onClick={() => handleNavigation("contact")}
                className={`w-full flex items-center gap-2 text-left text-[14px] py-2 px-4 rounded-[4px] ${
                  activeSection === "contact"
                    ? "bg-[#FEFEFE] text-[#F9C301]"
                    : "text-[#111102] hover:bg-[#FEFEFE] hover:text-[#F9C301]"
                }`}
              >
                {/* Contact Icon */}
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  xmlns="http://www.w3.org/2000/svg"
                  className="mr-2"
                >
                  <path d="M9.95421 15.5C10.275 15.5 10.5464 15.3891 10.7682 15.1672C10.99 14.9454 11.1007 14.6744 11.1 14.3542C11.0994 14.0339 10.9888 13.7626 10.7682 13.5402C10.5476 13.3177 10.2763 13.2071 9.95421 13.2083C9.63215 13.2095 9.36112 13.3205 9.14112 13.5411C8.92112 13.7617 8.81021 14.0327 8.80837 14.3542C8.80654 14.6756 8.91746 14.9469 9.14112 15.1682C9.36479 15.3894 9.63582 15.5 9.95421 15.5ZM9.12921 11.9708H10.825C10.825 11.4667 10.8825 11.0694 10.9974 10.7792C11.1123 10.4889 11.4368 10.0917 11.9709 9.58748C12.3681 9.19026 12.6813 8.81198 12.9105 8.45265C13.1396 8.09332 13.2542 7.66187 13.2542 7.15832C13.2542 6.30276 12.941 5.64582 12.3146 5.18748C11.6882 4.72915 10.9473 4.49998 10.0917 4.49998C9.22088 4.49998 8.51443 4.72915 7.97238 5.18748C7.43032 5.64582 7.05204 6.19582 6.83754 6.83748L8.35004 7.43332C8.42643 7.15832 8.59846 6.8604 8.86613 6.53957C9.13379 6.21873 9.54232 6.05832 10.0917 6.05832C10.5806 6.05832 10.9473 6.19215 11.1917 6.45982C11.4362 6.72748 11.5584 7.02143 11.5584 7.34165C11.5584 7.64721 11.4667 7.93382 11.2834 8.20148C11.1 8.46915 10.8709 8.71726 10.5959 8.94582C9.92365 9.54165 9.51115 9.99234 9.35838 10.2979C9.2056 10.6035 9.12921 11.1611 9.12921 11.9708ZM10 19.1667C8.73199 19.1667 7.54032 18.9262 6.42504 18.4452C5.30976 17.9643 4.33963 17.311 3.51463 16.4854C2.68963 15.6598 2.03665 14.6897 1.55571 13.575C1.07476 12.4603 0.833986 11.2687 0.833375 9.99998C0.832764 8.73132 1.07354 7.53965 1.55571 6.42498C2.03788 5.31032 2.69085 4.34018 3.51463 3.51457C4.3384 2.68896 5.30854 2.03598 6.42504 1.55565C7.54154 1.07532 8.73321 0.83454 10 0.833318C11.2669 0.832095 12.4585 1.07287 13.575 1.55565C14.6915 2.03843 15.6617 2.6914 16.4855 3.51457C17.3092 4.33773 17.9625 5.30787 18.4453 6.42498C18.9281 7.5421 19.1685 8.73376 19.1667 9.99998C19.1649 11.2662 18.9241 12.4579 18.4444 13.575C17.9647 14.6921 17.3117 15.6622 16.4855 16.4854C15.6592 17.3086 14.6891 17.9618 13.575 18.4452C12.461 18.9286 11.2693 19.1691 10 19.1667ZM10 17.3333C12.0473 17.3333 13.7813 16.6229 15.2021 15.2021C16.623 13.7812 17.3334 12.0472 17.3334 9.99998C17.3334 7.95276 16.623 6.21873 15.2021 4.7979C13.7813 3.37707 12.0473 2.66665 10 2.66665C7.95282 2.66665 6.21879 3.37707 4.79796 4.7979C3.37713 6.21873 2.66671 7.95276 2.66671 9.99998C2.66671 12.0472 3.37713 13.7812 4.79796 15.2021C6.21879 16.6229 7.95282 17.3333 10 17.3333Z" />
                </svg>
                Contact
              </button>
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

export default Header;
