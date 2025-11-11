import React from "react";
import { PhoneCall, MapPin, Mail } from "lucide-react";
import { ContactCard } from "@/components/";

export const ContactUsSection: React.FC = () => {
  const contacts = [
    {
      icon: (
        <i>
          <PhoneCall className="text-[#F9C301] md:w-[24px] md:h-[24px] h-[16px] w-[16px]" />
        </i>
      ),
      title: "Telephone",
      content: <a href="tel:+94750103398">+94 7501 03398</a>,
    },
    {
      icon: (
        <i>
          <MapPin className="text-[#F9C301] md:w-[24px] md:h-[24px] h-[16px] w-[16px]" />
        </i>
      ),
      title: "Address",
      content: "No.20, 6th Lane, Araliya Uyana, Pannipitiya",
    },
    {
      icon: (
        <i>
          <Mail className="text-[#F9C301] md:w-[24px] md:h-[24px] h-[16px] w-[16px]" />
        </i>
      ),
      title: "Email",
      content: (
        <a
          href="mailto:info@autoonline.lk"
          className="text-[#5B5B5B] no-underline hover:no-underline cursor-pointer"
          style={{ textDecoration: "none" }}
        >
          info@autoonline.lk
        </a>
      ),
    },
  ];

  return (
    <div
      className="text-left md:pb-10 md:pt-10 px-5 pb-5 md:py-0 md:px-[120px] bg-white"
      id="contact"
    >
      <h2 className="md:text-[32px] text-[16px] font-title text-[#111102] md:mb-8 mb-4">
        Contact Us
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 ">
        {contacts.map((contact, index) => (
          <ContactCard
            key={index}
            icon={contact.icon}
            title={contact.title}
            content={contact.content}
          />
        ))}
      </div>
    </div>
  );
};
