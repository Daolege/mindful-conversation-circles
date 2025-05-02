
import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useTranslations } from "@/hooks/useTranslations";

const TermsOfUse = () => {
  const { t } = useTranslations();

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-10 max-w-4xl">
        <h1 className="text-3xl font-bold mb-6">{t('common:termsOfUse')}</h1>
        
        <div className="prose max-w-none">
          <h2>1. Acceptance of Terms</h2>
          <p>
            By accessing and using the SecondRise website and services, you acknowledge that you have read, understood, and agree to be bound by these Terms of Use. If you do not agree to these terms, please do not use our services.
          </p>
          
          <h2>2. User Accounts</h2>
          <p>
            When you create an account with us, you must provide accurate and complete information. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.
          </p>
          
          <h2>3. Course Enrollment and Access</h2>
          <p>
            When you purchase a course, you are granted a limited, non-exclusive, non-transferable license to access and use the course materials for personal, non-commercial use. Course access may be limited to a specific period as indicated at the time of purchase.
          </p>
          
          <h2>4. Payment and Refunds</h2>
          <p>
            All payments are processed securely through our payment providers. Prices for courses are as listed on our website and may change from time to time. Refund policies for courses are as specified at the time of purchase.
          </p>
          
          <h2>5. Intellectual Property</h2>
          <p>
            All content provided on our website, including courses, videos, text, graphics, logos, and images, is the property of SecondRise or its content suppliers and is protected by international copyright laws. You may not reproduce, distribute, or create derivative works from this content without explicit permission.
          </p>
          
          <h2>6. User Conduct</h2>
          <p>
            You agree not to:
          </p>
          <ul>
            <li>Use our services for any illegal purpose</li>
            <li>Share your account or course access with others</li>
            <li>Copy, reproduce, or redistribute course materials</li>
            <li>Attempt to gain unauthorized access to our systems</li>
            <li>Engage in any activity that disrupts our services</li>
          </ul>
          
          <h2>7. Termination</h2>
          <p>
            We may terminate or suspend your account and access to our services at our sole discretion, without prior notice, for conduct that we believe violates these Terms of Use or is harmful to other users or us.
          </p>
          
          <h2>8. Disclaimer of Warranties</h2>
          <p>
            Our services are provided "as is" without any warranties, expressed or implied. We do not guarantee that our services will be error-free or uninterrupted, or that any defects will be corrected.
          </p>
          
          <h2>9. Limitation of Liability</h2>
          <p>
            To the fullest extent permitted by law, SecondRise shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly.
          </p>
          
          <h2>10. Governing Law</h2>
          <p>
            These Terms of Use shall be governed by and construed in accordance with the laws of Hong Kong, without regard to its conflict of law principles.
          </p>
          
          <h2>11. Changes to Terms</h2>
          <p>
            We reserve the right to modify these Terms of Use at any time. We will provide notice of significant changes by posting the new Terms on this page and updating the "Last Updated" date.
          </p>
          
          <h2>12. Contact Us</h2>
          <p>
            If you have any questions about these Terms of Use, please contact us at:
          </p>
          <p>
            Email: info@secondrise.com<br />
            Phone: +852 1234 5678
          </p>
          
          <p className="mt-6">Last Updated: May 1, 2025</p>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default TermsOfUse;
