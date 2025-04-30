
import { Loader2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const CheckoutLoading = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="flex items-center justify-center h-[calc(100vh-64px)]">
        <Loader2 className="h-8 w-8 animate-spin text-gray-600" />
      </div>
      <Footer />
    </div>
  );
};
