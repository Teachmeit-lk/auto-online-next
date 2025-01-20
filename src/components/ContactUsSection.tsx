import React from "react";
import { PhoneCall, MapPin, Mail } from "lucide-react";

import { ContactCard } from "@/components/atoms/index";

export const ContactUsSection: React.FC = () => {
  const contacts = [
    {
      icon: (
        <i className=" text-[#F9C301] w-[14.25px] h-[14.25px]">
          <PhoneCall />
        </i>
      ),
      title: "Telephone",
      content: "+94 753813398",
    },
    {
      icon: (
        <i className=" text-[#F9C301] w-[14.25px] h-[14.25px]">
          <MapPin />
        </i>
      ),
      title: "Address",
      content: "No.20, 6th Lane, Araliya Uyana, Pannipitiya",
    },
    {
      icon: (
        <i className=" text-[#F9C301] w-[14.25px] h-[14.25px]">
          <Mail />
        </i>
      ),
      title: "Email",
      content: "info@autoonline.lk",
    },
  ];

  return (
    <div className="text-left pb-10 pt-20 px-[120px] bg-white" id="contact">
      <h2 className="text-[32px] font-title text-[#111102] mb-8">Contact Us</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
