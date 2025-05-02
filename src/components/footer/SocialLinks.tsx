
import React from 'react';

const SocialLinks: React.FC = () => {
  return (
    <div className="flex space-x-4 mb-6">
      {/* Facebook */}
      <a href="#" className="hover:scale-110 transition-all">
        <img 
          src="https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/Facebook_Logo_%282019%29.png/600px-Facebook_Logo_%282019%29.png" 
          alt="Facebook" 
          className="h-8 w-8 rounded-full"
        />
      </a>
      
      {/* Instagram */}
      <a href="#" className="hover:scale-110 transition-all">
        <img 
          src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/e7/Instagram_logo_2016.svg/132px-Instagram_logo_2016.svg.png" 
          alt="Instagram" 
          className="h-8 w-8"
        />
      </a>
      
      {/* Twitter/X */}
      <a href="#" className="hover:scale-110 transition-all">
        <img 
          src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/57/X_logo_2023.png/600px-X_logo_2023.png" 
          alt="Twitter" 
          className="h-8 w-8"
        />
      </a>
      
      {/* LinkedIn */}
      <a href="#" className="hover:scale-110 transition-all">
        <img 
          src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/LinkedIn_logo_initials.png/600px-LinkedIn_logo_initials.png" 
          alt="LinkedIn" 
          className="h-8 w-8"
        />
      </a>
    </div>
  );
};

export default SocialLinks;
