
import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useTranslations } from "@/hooks/useTranslations";

const CookiePolicy = () => {
  const { t } = useTranslations();

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-10 max-w-4xl">
        <h1 className="text-3xl font-bold mb-6">{t('common:cookiePolicy')}</h1>
        
        <div className="prose max-w-none">
          <h2>1. What Are Cookies</h2>
          <p>
            Cookies are small text files that are stored on your computer or mobile device when you visit a website. They are widely used to make websites work more efficiently and provide information to the website owners.
          </p>
          
          <h2>2. How We Use Cookies</h2>
          <p>
            We use cookies for the following purposes:
          </p>
          <ul>
            <li><strong>Essential cookies:</strong> These are necessary for the website to function properly and cannot be turned off in our systems.</li>
            <li><strong>Performance cookies:</strong> These help us understand how visitors interact with our website by collecting and reporting information anonymously.</li>
            <li><strong>Functional cookies:</strong> These enable the website to provide enhanced functionality and personalization, such as remembering your preferences.</li>
            <li><strong>Targeting cookies:</strong> These may be set through our site by our advertising partners to build a profile of your interests and show you relevant advertisements on other sites.</li>
          </ul>
          
          <h2>3. Types of Cookies We Use</h2>
          <p>
            We use both session cookies, which are temporary and deleted when you close your browser, and persistent cookies, which remain on your device until they expire or you delete them manually.
          </p>
          
          <h2>4. Third-Party Cookies</h2>
          <p>
            Some cookies are placed by third parties on our behalf. These third parties may include analytics providers, advertising networks, and social media platforms. These third parties may use cookies, web beacons, and similar technologies to collect information about your use of our website.
          </p>
          
          <h2>5. Managing Cookies</h2>
          <p>
            Most web browsers allow you to control cookies through their settings preferences. To find out more about cookies, including how to see what cookies have been set and how to manage and delete them, visit www.aboutcookies.org or www.allaboutcookies.org.
          </p>
          
          <h2>6. Consequences of Disabling Cookies</h2>
          <p>
            If you disable or decline cookies, some features of the website may not function properly or at all. This does not prevent you from browsing our website, but some features may be limited.
          </p>
          
          <h2>7. Updates to This Policy</h2>
          <p>
            We may update this Cookie Policy from time to time to reflect changes in technology, regulation, or our business practices. Any changes will be posted on this page with an updated "Last Updated" date.
          </p>
          
          <h2>8. Contact Us</h2>
          <p>
            If you have any questions about our use of cookies, please contact us at:
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

export default CookiePolicy;
