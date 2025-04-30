
import React from "react";

interface PasswordStrengthIndicatorProps {
  password: string;
}

export const PasswordStrengthIndicator: React.FC<PasswordStrengthIndicatorProps> = ({ password }) => {
  const getStrength = (pass: string): number => {
    let strength = 0;
    
    // If password has any characters, it's at least strength 1
    if (pass.length > 0) strength++;
    
    // Length check
    if (pass.length >= 6) strength++;
    
    // Uppercase letter check
    if (/[A-Z]/.test(pass)) strength++;
    
    // Lowercase letter check
    if (/[a-z]/.test(pass)) strength++;
    
    // Number check
    if (/[0-9]/.test(pass)) strength++;
    
    // Special character check
    if (/[^A-Za-z0-9]/.test(pass)) strength++;
    
    return strength;
  };

  const strength = getStrength(password);

  const getColor = () => {
    if (strength === 0) return "bg-gray-200";
    if (strength <= 2) return "bg-red-500";
    if (strength <= 3) return "bg-yellow-500";
    return "bg-green-500";
  };

  const getMessage = () => {
    if (strength === 0) return { text: "请输入密码", color: "text-gray-600" };
    if (strength <= 2) return { text: "密码强度：弱", color: "text-red-600" };
    if (strength <= 3) return { text: "密码强度：中等", color: "text-yellow-600" };
    return { text: "密码强度：强", color: "text-green-600" };
  };

  const message = getMessage();

  return (
    <div className="space-y-2 mt-1.5">
      <div className="flex space-x-1">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className={`h-1 w-full rounded-full transition-colors duration-300 ${
              i < strength ? getColor() : 'bg-gray-200'
            }`}
          />
        ))}
      </div>
      <p className={`text-xs ${message.color}`}>{message.text}</p>
      <ul className="text-xs text-gray-500 space-y-1 mt-1">
        <li>• 输入您想要的密码</li>
        <li>• 建议使用大小写字母</li>
        <li>• 建议使用数字</li>
        <li>• 建议使用特殊字符</li>
      </ul>
    </div>
  );
};
