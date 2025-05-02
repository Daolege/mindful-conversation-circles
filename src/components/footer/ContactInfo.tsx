
import React from 'react';
import { Mail, Phone, MapPin } from 'lucide-react';

interface ContactInfoProps {
  emails?: string[];
  phones?: string[];
  location?: string;
}

const ContactInfo: React.FC<ContactInfoProps> = ({ emails, phones, location }) => {
  return (
    <div className="space-y-1.5">
      {emails && emails.map((email, index) => (
        <div key={`email-${index}`} className="flex items-center group">
          <Mail className="h-4 w-4 mr-2 text-[#999999] group-hover:text-knowledge-primary transition-colors" />
          <a href={`mailto:${email}`} className="text-sm text-[#999999] hover:text-white transition-colors">
            {email}
          </a>
        </div>
      ))}
      
      {phones && phones.map((phone, index) => (
        <div key={`phone-${index}`} className="flex items-center group">
          <Phone className="h-4 w-4 mr-2 text-[#999999] group-hover:text-knowledge-primary transition-colors" />
          <a href={`https://wa.me/${phone.replace(/\D/g, '')}`} className="text-sm text-[#999999] hover:text-white transition-colors">
            WhatsApp: {phone}
          </a>
        </div>
      ))}
      
      {location && (
        <div className="flex items-start group">
          <MapPin className="h-4 w-4 mr-2 mt-0.5 text-[#999999] group-hover:text-knowledge-primary transition-colors" />
          <span className="text-sm text-[#999999] group-hover:text-white transition-colors">
            {location}
          </span>
        </div>
      )}
    </div>
  );
};

export default ContactInfo;
