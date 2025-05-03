
import React from 'react';
import { Mail, MapPin, Phone } from 'lucide-react';

interface ContactInfoProps {
  emails?: string[];
  phones?: string[];
  location?: string;
}

const ContactInfo: React.FC<ContactInfoProps> = ({ emails, phones, location }) => {
  return (
    <div className="space-y-5">
      {emails && emails.map((email, index) => (
        <a 
          key={`email-${index}`} 
          href={`mailto:${email}`} 
          className="flex items-center group hover:bg-[#2d3748] rounded-md p-2.5 -ml-2 transition-colors duration-300"
        >
          <Mail className="h-5 w-5 mr-3 text-[#999999] group-hover:text-white transition-colors duration-300" />
          <span className="text-sm text-[#BBBBBB] group-hover:text-white transition-colors duration-300">
            {email}
          </span>
        </a>
      ))}
      
      {phones && phones.map((phone, index) => (
        <a 
          key={`phone-${index}`} 
          href={`https://wa.me/${phone.replace(/\D/g, '')}`} 
          className="flex items-center group hover:bg-[#2d3748] rounded-md p-2.5 -ml-2 transition-colors duration-300"
        >
          <Phone className="h-5 w-5 mr-3 text-[#25D366] group-hover:text-[#25D366] transition-colors duration-300" />
          <span className="text-sm text-[#BBBBBB] group-hover:text-white transition-colors duration-300">
            {phone}
          </span>
        </a>
      ))}
      
      {location && (
        <div className="flex items-start group hover:bg-[#2d3748] rounded-md p-2.5 -ml-2 transition-colors duration-300">
          <MapPin className="h-5 w-5 mr-3 mt-0.5 text-[#999999] group-hover:text-white transition-colors duration-300" />
          <span className="text-sm text-[#BBBBBB] group-hover:text-white transition-colors duration-300">
            {location}
          </span>
        </div>
      )}
    </div>
  );
};

export default ContactInfo;
