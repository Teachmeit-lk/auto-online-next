import React from "react";

interface ContactCardProps {
  icon: React.ReactNode;
  title: string;
  content: string;
}

const ContactCard: React.FC<ContactCardProps> = ({ icon, title, content }) => {
  return (
    <div className="flex flex-col items-center bg-[#F8F8F8] rounded-[10px] p-6">
      <div className="flex flex-row items-center mb-2">
        <div className="text-[#F9C301] text-xl mr-5">{icon}</div>
        <p className="font-bold text-[#111102] text-[20px] font-body">
          {title}
        </p>
      </div>
      <p className="text-[#5B5B5B] text-[18px] text-center font-body">
        {content}
      </p>
    </div>
  );
};

const ContactUsSection: React.FC = () => {
  const contacts = [
    {
      icon: (
        <i className="fas fa-phone-volume text-[#F9C301] w-[14.25px] h-[14.25px]"></i>
      ),
      title: "Telephone",
      content: "+94 753813398",
    },
    {
      icon: (
        <i className="fas fa-map-marker-alt text-[#F9C301] w-[14.25px] h-[14.25px]"></i>
      ),
      title: "Address",
      content: "No.20, 6th Lane, Araliya Uyana, Pannipitiya",
    },
    {
      icon: (
        <i className="fas fa-envelope text-[#F9C301] w-[14.25px] h-[14.25px]"></i>
      ),
      title: "Email",
      content: "info@autoonline.lk",
    },
  ];

  return (
    <div className="text-left pb-10 px-[120px] bg-white">
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

export default ContactUsSection;
