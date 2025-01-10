import React from "react";

const ContactForm: React.FC = () => {
  return (
    <div className="bg-white px-20 pt-10 pb-20">
      <div className="bg-[#F8F8F8] rounded-[15px] w-[639px] h-[746px] mx-auto px-16 py-12">
        <h2 className="text-center font-title text-[24px] text-[#111102] mb-6">
          Get In Touch with Us
        </h2>
        <form className="space-y-6 pl-2 ">
          {/* Name Field */}
          <div className="flex flex-col justify-center">
            <label
              htmlFor="name"
              className="text-[#111102] text-[18px] font-body font-[500]"
            >
              Name
            </label>
            <input
              type="text"
              id="name"
              className="mt-2 p-3 text-[#111102] w-[495px] h-[54px] bg-white rounded-[8px] border border-gray-300 shadow-sm focus:outline-none focus:ring-1 focus:ring-[#F9C301] focus:border-[#F9C301] hover:ring-1 hover:ring-[#F9C301]"
              placeholder="Enter your name"
            />
          </div>

          {/* Email Field */}
          <div className="flex flex-col">
            <label
              htmlFor="email"
              className="text-[#111102] text-[18px] font-body font-[500]"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              className="mt-2 p-3 text-[#111102] w-[495px] h-[54px] bg-white rounded-[8px] border border-gray-300 shadow-sm focus:outline-none focus:ring-1 focus:ring-[#F9C301] focus:border-[#F9C301] hover:ring-1 hover:ring-[#F9C301]"
              placeholder="Enter your email"
            />
          </div>

          {/* WhatsApp Number Field */}
          <div className="flex flex-col ">
            <label
              htmlFor="whatsapp"
              className="text-[#111102] text-[18px] font-body font-[500]"
            >
              WhatsApp Number
            </label>
            <input
              type="text"
              id="whatsapp"
              className="mt-2 p-3 text-[#111102] w-[495px] h-[54px] bg-white rounded-[8px] border border-gray-300 shadow-sm focus:outline-none focus:ring-1 focus:ring-[#F9C301] focus:border-[#F9C301] hover:ring-1 hover:ring-[#F9C301]"
              placeholder="Enter your WhatsApp number"
            />
          </div>

          {/* Message Field */}
          <div className="flex flex-col">
            <label
              htmlFor="message"
              className="text-[#111102] text-[18px] font-body font-[500]"
            >
              Message
            </label>
            <textarea
              id="message"
              rows={4}
              className="mt-2 p-3 text-[#111102] w-[495px] h-[105px] bg-white rounded-[8px] border border-gray-300 shadow-sm focus:outline-none focus:ring-1 focus:ring-[#F9C301] focus:border-[#F9C301] hover:ring-1 hover:ring-[#F9C301]"
              placeholder="Enter your message"
            ></textarea>
          </div>

          {/* Submit Button */}
          <div className="flex flex-col">
            <button
              type="submit"
              className="mt-4  w-[495px] h-[54px] bg-[#F9C301] text-[#111102] font-body text-[18px] font-bold py-2 px-4 rounded-[8px] shadow-md hover:bg-yellow-600 focus:outline-none focus:ring-1 focus:ring-[#F9C301] focus:ring-offset-1"
            >
              SEND
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ContactForm;
