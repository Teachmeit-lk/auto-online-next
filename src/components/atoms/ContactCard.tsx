import React from "react";

interface ContactCardProps {
  icon: React.ReactNode;
  title: string;
  content: string;
}

export const ContactCard: React.FC<ContactCardProps> = ({
  icon,
  title,
  content,
}) => {
  return (
    <div className="flex flex-col items-center bg-[#F8F8F8] rounded-[10px] p-6">
      <div className="flex flex-row items-center mb-2">
        <div className="text-[#F9C301] text-xl mr-3">{icon}</div>
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
