
import React from 'react';
import { Facebook, Instagram, Twitter, Linkedin } from 'lucide-react';

const SocialLinks: React.FC = () => {
  return (
    <div className="flex space-x-4 mb-6">
      <a href="#" className="bg-[#333333] hover:bg-knowledge-primary transition-all p-2 rounded-full">
        <Facebook className="h-5 w-5 text-white" />
      </a>
      <a href="#" className="bg-[#333333] hover:bg-knowledge-primary transition-all p-2 rounded-full">
        <Instagram className="h-5 w-5 text-white" />
      </a>
      <a href="#" className="bg-[#333333] hover:bg-knowledge-primary transition-all p-2 rounded-full">
        <Twitter className="h-5 w-5 text-white" />
      </a>
      <a href="#" className="bg-[#333333] hover:bg-knowledge-primary transition-all p-2 rounded-full">
        <Linkedin className="h-5 w-5 text-white" />
      </a>
    </div>
  );
};

export default SocialLinks;
