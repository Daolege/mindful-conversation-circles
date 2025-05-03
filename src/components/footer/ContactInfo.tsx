
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
          <div className="flex flex-col">
            <span className="text-sm text-[#BBBBBB] group-hover:text-white transition-colors duration-300">
              {email}
            </span>
          </div>
        </a>
      ))}
      
      {phones && phones.map((phone, index) => {
        // Determine if this is a WhatsApp number or regular phone
        const isWhatsApp = index === 0; // Assume first phone number is WhatsApp
        return (
          <a 
            key={`phone-${index}`} 
            href={`https://wa.me/${phone.replace(/\D/g, '')}`} 
            className="flex items-center group hover:bg-[#2d3748] rounded-md p-2.5 -ml-2 transition-colors duration-300"
          >
            {isWhatsApp ? (
              <>
                <div className="bg-[#25D366] text-white p-1 rounded mr-3 flex items-center justify-center">
                  <Phone className="h-4 w-4" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-[#999999] font-medium">WhatsApp</span>
                  <span className="text-sm text-[#BBBBBB] group-hover:text-white transition-colors duration-300">
                    {phone}
                  </span>
                </div>
              </>
            ) : (
              <>
                <Phone className="h-5 w-5 mr-3 text-[#999999] group-hover:text-white transition-colors duration-300" />
                <div className="flex flex-col">
                  <span className="text-xs text-[#999999] font-medium">电话</span>
                  <span className="text-sm text-[#BBBBBB] group-hover:text-white transition-colors duration-300">
                    {phone}
                  </span>
                </div>
              </>
            )}
          </a>
        );
      })}
    </div>
  );
};

export default ContactInfo;
