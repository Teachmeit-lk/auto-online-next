import React from "react";

interface ContactCardProps {
  icon: React.ReactNode;
  title: string;
  content: React.ReactNode;
}

export const ContactCard: React.FC<ContactCardProps> = ({
  icon,
  title,
  content,
}) => {
  return (
    <div className="flex flex-col items-center bg-[#F8F8F8] rounded-[10px] md:px-6 px-4 md:py-10 py-6">
      <div className="flex flex-row items-center mb-2">
        <div className="text-[#F9C301] text-xl md:mr-3 mr-2">{icon}</div>
        <p className="font-bold text-[#111102] md:text-[20px] text-[14px] font-body">
          {title}
        </p>
      </div>
      <p className="text-[#5B5B5B] md:text-[18px] text-[12px] text-center font-body">
        {content}
      </p>
    </div>
  );
};
