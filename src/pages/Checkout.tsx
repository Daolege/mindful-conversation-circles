import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSearchParams } from 'react-router-dom';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, AlertTriangle } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { formatCurrency } from '@/lib/utils';

const getCourseCurrency = (course: any) => {
  return course.currency || 'CNY';
};

const Checkout = () => {
  const [searchParams] = useSearchParams();
  const courseId = searchParams.get('courseId');
  const navigate = useNavigate();
  const location = useLocation();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCourseDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        // Replace this with your actual API endpoint
        const response = await fetch(`https://api.example.com/courses/${courseId}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setCourse(data);
      } catch (e) {
        setError(e);
      } finally {
        setLoading(false);
      }
    };

    if (courseId) {
      fetchCourseDetails();
    } else {
      setError('Course ID is missing.');
      setLoading(false);
    }
  }, [courseId]);

  const handlePayment = () => {
    // Implement your payment logic here
    console.log('Payment processing initiated for course:', course);
    // After successful payment, you might want to redirect the user
    // to a confirmation page or their course dashboard.
    alert('Payment processing initiated. This is a placeholder.');
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="flex justify-center items-center h-screen">
          <p>Loading course details...</p>
        </div>
        <Footer />
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navbar />
        <div className="flex justify-center items-center h-screen">
          <div className="text-red-500">
            <AlertTriangle className="inline-block mr-2" />
            Error: {error.message || error}
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (!course) {
    return (
      <>
        <Navbar />
        <div className="flex justify-center items-center h-screen">
          <div className="text-gray-500">
            <AlertTriangle className="inline-block mr-2" />
            Course not found.
          </div>
        </div>
        <Footer />
      </>
    );
  }

  const { title, description, price } = course;
  const currency = getCourseCurrency(course);

  return (
    <>
      <Navbar />
      <div className="container mx-auto mt-16 mb-10 p-4">
        <h1 className="text-2xl font-bold mb-8">Checkout</h1>
        <div className="flex flex-col md:flex-row gap-8">
          <div className="md:w-3/4">
            <Card className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Course Summary</h2>
              <div className="mb-4">
                <strong>{title}</strong>
                <p className="text-gray-600">{description}</p>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-lg font-semibold">Price:</span>
                <span className="text-lg font-bold">{formatCurrency(price, currency)}</span>
              </div>
            </Card>
          </div>
          <div className="md:w-1/4">
            <Card className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Payment Details</h2>
              <div className="mb-6">
                <p className="text-gray-700">Confirm your purchase by clicking the button below.</p>
              </div>
              <Button className="w-full py-3" onClick={handlePayment}>
                <CheckCircle className="mr-2" />
                Pay {formatCurrency(price, currency)}
              </Button>
            </Card>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Checkout;
