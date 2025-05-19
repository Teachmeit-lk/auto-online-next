import React from "react";
import Image from "next/image";
import Link from "next/link";

import {
  FacebookIcon,
  YoutubeIcon,
  InstagramIcon,
  TwitterIcon,
  HeroImg1,
  HeroImg2,
  HeroImg3,
} from "@/assets/Images";
import HeaderLogo from "@/assets/Images/HeaderLogo.png";

export const HeroSection: React.FC = () => {
  return (
    <div id="home">
      <div className="hidden relative bg-[#F8F8F8] md:flex  justify-between px-20">
        {/* Text Section */}
        <div className="max-w-2xl pt-20">
          <h1
            className="text-[72px]  text-black font-title "
            style={{ textShadow: "4px 4px 6px rgba(254, 221, 151, 0.52)" }}
          >
            Trust AutoOnline
          </h1>
          <p className="text-[18px] text-[#111102] font-body">
            Scale your business with an easy-to-manage solution that will
            revolutionize <br /> the way you sell and source auto parts.
          </p>
        </div>

        {/* Image Section */}
        <div className="relative overflow-hidden pb-5">
          <Image
            src={HeroImg1}
            alt="Car"
            className=" w-[534px] h-[408px]  right-[-25px] "
            style={{ position: "relative", top: "-25px" }}
          />
          <Image
            src={HeroImg2}
            alt="Oil Splash"
            className="absolute  w-[481px] h-[378] top-[150px] right-[-3px]  "
            style={{ rotate: "34.98deg" }}
          />
          <Image
            src={HeroImg3}
            alt="Oil Splash"
            className="absolute right-[-5px] w-[361px] h-[314] top-[100px] "
            style={{ rotate: "6deg" }}
          />
        </div>

        {/* Social Media Icons */}
        <div className="absolute bottom-8 left-0 flex space-x-4 text-gray-500 px-20">
          <a href="https://facebook.com" className="hover:text-blue-600">
            <FacebookIcon />
          </a>
          <a href="#" className="hover:text-red-600 ">
            <YoutubeIcon />
          </a>
          <a href="#" className="hover:text-pink-500">
            <InstagramIcon />
          </a>
          <a href="#" className="hover:text-sky-500">
            <TwitterIcon />
          </a>
        </div>
      </div>

      <div className="md:hidden relative bg-[#F8F8F8] flex flex-col items-center overflow-hidden pt-5">
        <Image
          src={HeaderLogo}
          alt="HeaderLogo"
          className="w-[67px] h-[56px] mb-1"
        />
        <h1
          className="text-[32px] text-black font-title mb-1"
          style={{ textShadow: "4px 4px 6px rgba(254, 221, 151, 0.52)" }}
        >
          Trust AutoOnline
        </h1>
        {/* Image Section */}
        <div className="relative overflow-hidden  pl-[58px]">
          <Image
            src={HeroImg1}
            alt="Car"
            className="w-[286px] h-[247px] sm:w-[534px] sm:h-[408px]  right-[-25px]"
            style={{ position: "relative", top: "-25px" }}
          />
          <Image
            src={HeroImg2}
            alt="Oil Splash"
            className="absolute top-[105px] w-[290px] h-[200px]  sm:w-[481px] sm:h-[378] sm:top-[150px] sm:right-[-3px]  "
            style={{ rotate: "34.98deg" }}
          />
          <Image
            src={HeroImg3}
            alt="Oil Splash"
            className="absolute right-[-5px]  w-[233px] h-[205px] sm:w-[361px] sm:h-[314] sm:top-[100px] top-[48px] "
            style={{ rotate: "6deg" }}
          />
        </div>

        {/* Text Section */}
        <div className="pt-6 text-center px-4">
          <p className="text-[12px] text-[#111102] font-body px-4">
            Scale your business with an easy-to-manage solution that will
            revolutionize the way you sell and source auto parts.
          </p>
          <button className="mt-4 mb-2  w-full bg-[#F9C301] h-[36px] text-[#111102] font-body text-[10px] md:text-[18px] font-bold md:py-3  rounded-full shadow-md hover:bg-yellow-600 focus:outline-none focus:ring-1 focus:ring-[#F9C301] focus:ring-offset-1">
            <Link href="/#services" type="submit">
              GET STARTED
            </Link>
          </button>
        </div>

        {/* Social Media Icons */}
        <div className="flex space-x-4 text-gray-500 mt-2 pb-5">
          <a href="https://facebook.com" className="hover:text-blue-600">
            <FacebookIcon />
          </a>
          <a href="#" className="hover:text-red-600">
            <YoutubeIcon />
          </a>
          <a href="#" className="hover:text-pink-500">
            <InstagramIcon />
          </a>
          <a href="#" className="hover:text-sky-500">
            <TwitterIcon />
          </a>
        </div>
      </div>
    </div>
  );
};
