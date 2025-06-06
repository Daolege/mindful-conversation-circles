
import React, { useEffect, useState, useRef } from 'react';
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, AlertCircle } from "lucide-react";
import { useCourseEditor } from './CourseEditorContext';

interface SaveStatusDisplayProps {
  success?: boolean;
  error?: string | null;
  autoHideSuccess?: boolean;
  hideDelay?: number;
  saving?: boolean; 
}

const SaveStatusDisplay: React.FC<SaveStatusDisplayProps> = ({ 
  success, 
  error, 
  autoHideSuccess = true,
  hideDelay = 3000,
  saving
}) => {
  const [visible, setVisible] = useState(false);
  const courseEditor = useCourseEditor();
  const timerRef = useRef<number | null>(null);
  const isMounted = useRef(true);
  
  // Use either props or context values
  const isSaving = saving !== undefined ? saving : courseEditor?.isSaving;
  const showSuccess = success !== undefined ? success : !isSaving && !courseEditor?.saveError;
  const showError = error !== undefined ? error : courseEditor?.saveError;
  
  // 添加debug日志
  useEffect(() => {
    console.log("[SaveStatusDisplay] Status updated:", {
      isSaving,
      showSuccess,
      showError,
      visible
    });
  }, [isSaving, showSuccess, showError, visible]);
  
  // Clean up on unmount
  useEffect(() => {
    return () => {
      // Mark as unmounted
      isMounted.current = false;
      
      // Clear any running timers
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, []);
  
  // Control display state, success message automatically disappears after delay
  useEffect(() => {
    // Clear any existing timer
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    
    // Handle saving state specifically
    if (isSaving) {
      setVisible(true);
      console.log("[SaveStatusDisplay] Showing saving state");
      return;
    }
    
    if (showSuccess || showError) {
      setVisible(true);
      
      if (showSuccess && autoHideSuccess) {
        console.log("[SaveStatusDisplay] Setting success auto-hide timer");
        // Store timer reference so we can clear it if needed
        timerRef.current = window.setTimeout(() => {
          if (isMounted.current) {
            console.log("[SaveStatusDisplay] Auto-hiding success message");
            setVisible(false);
            timerRef.current = null;
          }
        }, hideDelay);
      }
    } else {
      console.log("[SaveStatusDisplay] Hiding all messages");
      setVisible(false);
    }
  }, [showSuccess, showError, autoHideSuccess, hideDelay, isSaving]);
  
  if (!visible) {
    console.log("[SaveStatusDisplay] Not visible, returning null");
    return null;
  }
  
  if (isSaving) {
    console.log("[SaveStatusDisplay] Showing saving state");
    return (
      <Alert className="bg-blue-50 text-blue-800 border-blue-200 mb-4">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>保存中</AlertTitle>
        <AlertDescription>
          正在保存作业数据，请稍候...
        </AlertDescription>
      </Alert>
    );
  }
  
  if (showSuccess) {
    console.log("[SaveStatusDisplay] Showing success alert");
    return (
      <Alert className="bg-green-50 text-green-800 border-green-200 mb-4">
        <CheckCircle className="h-4 w-4" />
        <AlertTitle>保存成功</AlertTitle>
        <AlertDescription>
          作业数据已成功保存
        </AlertDescription>
      </Alert>
    );
  }
  
  if (showError) {
    console.log("[SaveStatusDisplay] Showing error alert:", showError);
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>保存失败</AlertTitle>
        <AlertDescription>{showError}</AlertDescription>
      </Alert>
    );
  }
  
  return null;
};

export default SaveStatusDisplay;
