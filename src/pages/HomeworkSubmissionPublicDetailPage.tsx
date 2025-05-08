import React from 'react';
import { useAuth } from "@/contexts/authHooks";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Loader2 } from "lucide-react";
import HomeworkSubmissionPublicDetail from "@/components/admin/homework/HomeworkSubmissionPublicDetail";

const HomeworkSubmissionPublicDetailPage = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { submissionId, courseId } = useParams<{ submissionId: string; courseId: string }>();

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!submissionId) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow container mx-auto px-4 py-8">
          <div className="text-xl text-gray-600">未找到指定的作业提交</div>
        </div>
        <Footer />
      </div>
    );
  }

  const handleBack = () => {
    // If we have a courseId, go back to the course homework page
    if (courseId) {
      navigate(`/admin/courses-new/${courseId}/homework`);
    } else {
      // Otherwise just go back
      navigate(-1);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8">
        <HomeworkSubmissionPublicDetail 
          submissionId={submissionId} 
          onBack={handleBack}
        />
      </main>
      <Footer />
    </div>
  );
};

export default HomeworkSubmissionPublicDetailPage;
