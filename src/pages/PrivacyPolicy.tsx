
import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useTranslations } from "@/hooks/useTranslations";

const PrivacyPolicy = () => {
  const { t } = useTranslations();

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-10 max-w-4xl">
        <h1 className="text-3xl font-bold mb-6">{t('common:privacyPolicy')}</h1>
        
        <div className="prose max-w-none">
          <h2>1. Introduction</h2>
          <p>
            Welcome to SecondRise ("we", "our", or "us"). We are committed to protecting your personal information and your right to privacy. This Privacy Policy explains how we collect, use, and share your personal information when you visit our website, use our services, or otherwise interact with us.
          </p>
          
          <h2>2. Information We Collect</h2>
          <p>
            We collect information that you provide to us directly, such as when you register for an account, purchase a course, or contact us for support. This information may include:
          </p>
          <ul>
            <li>Name, email address, and contact details</li>
            <li>Account credentials</li>
            <li>Payment information</li>
            <li>Course preferences and progress</li>
            <li>Communications with us</li>
          </ul>
          
          <h2>3. How We Use Your Information</h2>
          <p>
            We use your personal information for the following purposes:
          </p>
          <ul>
            <li>To provide and maintain our services</li>
            <li>To process your payments</li>
            <li>To personalize your experience</li>
            <li>To communicate with you about your account or courses</li>
            <li>To improve our website and services</li>
            <li>For marketing and promotional purposes, if you have consented</li>
          </ul>
          
          <h2>4. Sharing Your Information</h2>
          <p>
            We may share your personal information with:
          </p>
          <ul>
            <li>Service providers that help us operate our business</li>
            <li>Payment processors to complete transactions</li>
            <li>As required by law or to protect our rights</li>
          </ul>
          
          <h2>5. Data Security</h2>
          <p>
            We implement appropriate security measures to protect your personal information from unauthorized access, alteration, disclosure, or destruction. However, no data transmission over the Internet or storage system can be guaranteed to be 100% secure.
          </p>
          
          <h2>6. Data Retention</h2>
          <p>
            We will retain your personal information only for as long as necessary to fulfill the purposes for which we collected it, including to satisfy legal requirements.
          </p>
          
          <h2>7. Your Rights</h2>
          <p>
            Depending on your location, you may have the right to:
          </p>
          <ul>
            <li>Access your personal information</li>
            <li>Correct inaccurate information</li>
            <li>Delete your information</li>
            <li>Object to our use of your information</li>
            <li>Withdraw consent</li>
          </ul>
          
          <h2>8. Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date.
          </p>
          
          <h2>9. Contact Us</h2>
          <p>
            If you have any questions about this Privacy Policy or our practices, please contact us at:
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

export default PrivacyPolicy;
