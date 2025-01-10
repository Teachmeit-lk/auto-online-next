import React from "react";
import Image from "next/image";

import {
  FacebookIcon,
  InstagramIcon,
  TwitterIcon,
  YoutubeIcon,
} from "@/components/atoms/index";
import HeaderLogo from "@/assets/HeaderLogo.png";

const Footer: React.FC = () => {
  return (
    <footer className="bg-[#F8F8F8] py-10 px-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        {/* Logo and Contact Information */}
        <div className="mb-8 md:mb-0">
          <Image
            src={HeaderLogo}
            alt="Autoonline Logo"
            className="w-[101px] h-[84px]"
          />
          <p className="text-gray-700 mt-4">
            {/* Phone */}
            <span className="flex items-center mb-2">
              <i className="fas fa-phone-alt text-[#111102] w-[14.25px] h-[14.25px]"></i>
              <span className="ml-2 font-body text-[18px] text-[#5B5B5B]">
                +94 7538 13398
              </span>
            </span>

            {/* Address */}
            <span className="flex items-center mb-2">
              <i className="fas fa-map-marker-alt text-[#111102]  w-[14.25px] h-[14.25px]"></i>
              <span className="ml-2 font-body text-[18px] text-[#5B5B5B]">
                No.20, 6th Lane, Araliya Uyana, Pannipitiya
              </span>
            </span>

            {/* Email */}
            <span className="flex items-center">
              <i className="fas fa-envelope text-[#111102]  w-[14.25px] h-[14.25px]"></i>
              <span className="ml-2 font-body text-[18px] text-[#5B5B5B]">
                info@autoonline.lk
              </span>
            </span>
          </p>

          <div className="flex mt-4 space-x-4">
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
        </div>

        {/* Footer Links */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full md:w-auto">
          <div>
            <h3 className="text-[18px] font-body text-[#111102] mb-4 font-bold ">
              Information
            </h3>
            <ul className="text-gray-700 space-y-2">
              <li>
                <a
                  href="#"
                  className="hover:text-gray-900 font-body text-[18px] text-[#5B5B5B]"
                >
                  About Us
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-gray-900 font-body text-[18px] text-[#5B5B5B]"
                >
                  Delivery Info
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-gray-900 font-body text-[18px] text-[#5B5B5B]"
                >
                  Privacy Policy
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-gray-900 font-body text-[18px] text-[#5B5B5B]"
                >
                  Terms & Conditions
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-[18px] font-body text-[#111102] mb-4 font-bold">
              User Area
            </h3>
            <ul className="text-gray-700 space-y-2">
              <li>
                <a
                  href="#"
                  className="hover:text-gray-900 font-body text-[18px] text-[#5B5B5B]"
                >
                  My Account
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-gray-900 font-body text-[18px] text-[#5B5B5B]"
                >
                  Login
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-[18px] font-body text-[#111102] mb-4 font-bold ">
              Guide & Help
            </h3>
            <ul className="text-gray-700 space-y-2">
              <li>
                <a
                  href="#"
                  className="hover:text-gray-900 font-body text-[18px] text-[#5B5B5B]"
                >
                  Careers
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-gray-900 font-body text-[18px] text-[#5B5B5B]"
                >
                  FAQs
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-gray-900 font-body text-[18px] text-[#5B5B5B]"
                >
                  Contact Us
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Footer Bottom Section */}
      <div className="pt-6 flex flex-col md:flex-row justify-center md:justify-between items-center text-[12px] text-[#5B5B5B] font-body font-[300]">
        <p className="text-center md:order-1 md:flex-1">
          Copyright © 2024 <span className="text-[#930000]">Autoonline</span>.
          All Rights Reserved.
        </p>

        <div className="flex space-x-4 mt-4 md:mt-0 md:order-2">
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
    </footer>
  );
};

export default Footer;
