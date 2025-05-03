
import React from 'react';
import { Mail, Phone, MapPin } from 'lucide-react';

interface ContactInfoProps {
  emails?: string[];
  phones?: string[];
  location?: string;
}

const ContactInfo: React.FC<ContactInfoProps> = ({ emails, phones, location }) => {
  return (
    <div className="space-y-3">
      {emails && emails.map((email, index) => (
        <a 
          key={`email-${index}`} 
          href={`mailto:${email}`} 
          className="flex items-center group hover:bg-[#2d3748] rounded-md p-1 -ml-1 transition-colors"
        >
          <Mail className="h-4 w-4 mr-2.5 text-[#999999] group-hover:text-white transition-colors" />
          <span className="text-sm text-[#BBBBBB] group-hover:text-white transition-colors">
            {email}
          </span>
        </a>
      ))}
      
      {phones && phones.map((phone, index) => (
        <a 
          key={`phone-${index}`} 
          href={`https://wa.me/${phone.replace(/\D/g, '')}`} 
          className="flex items-center group hover:bg-[#2d3748] rounded-md p-1 -ml-1 transition-colors"
        >
          <Phone className="h-4 w-4 mr-2.5 text-[#999999] group-hover:text-white transition-colors" />
          <span className="text-sm text-[#BBBBBB] group-hover:text-white transition-colors">
            WhatsApp: {phone}
          </span>
        </a>
      ))}
      
      {location && (
        <div className="flex items-start group hover:bg-[#2d3748] rounded-md p-1 -ml-1 transition-colors">
          <MapPin className="h-4 w-4 mr-2.5 mt-0.5 text-[#999999] group-hover:text-white transition-colors" />
          <span className="text-sm text-[#BBBBBB] group-hover:text-white transition-colors">
            {location}
          </span>
        </div>
      )}
    </div>
  );
};

export default ContactInfo;
