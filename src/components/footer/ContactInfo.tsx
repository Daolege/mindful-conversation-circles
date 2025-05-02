
import React from 'react';
import { Mail, Phone, MapPin } from 'lucide-react';
import { siteConfig } from "@/config/site";

interface ContactInfoProps {
  email?: string;
  phone?: string;
}

const ContactInfo: React.FC<ContactInfoProps> = ({ email, phone }) => {
  return (
    <div className="space-y-1.5">
      {email && (
        <div className="flex items-center group">
          <Mail className="h-4 w-4 mr-2 text-[#999999] group-hover:text-knowledge-primary transition-colors" />
          <a href={`mailto:${email}`} className="text-sm text-[#BBBBBB] hover:text-white transition-colors">
            {email}
          </a>
        </div>
      )}
      
      {phone && (
        <div className="flex items-center group">
          <Phone className="h-4 w-4 mr-2 text-[#999999] group-hover:text-knowledge-primary transition-colors" />
          <a href={`https://wa.me/${phone.replace(/\D/g, '')}`} className="text-sm text-[#BBBBBB] hover:text-white transition-colors">
            {phone}
          </a>
        </div>
      )}
      
      {siteConfig.email && (
        <div className="flex items-start group">
          <MapPin className="h-4 w-4 mr-2 mt-0.5 text-[#999999] group-hover:text-knowledge-primary transition-colors" />
          <span className="text-sm text-[#BBBBBB] group-hover:text-white transition-colors">
            {siteConfig.email}
          </span>
        </div>
      )}
    </div>
  );
};

export default ContactInfo;
