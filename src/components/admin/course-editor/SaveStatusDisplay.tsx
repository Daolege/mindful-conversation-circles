
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
  const isSaving = saving !== undefined ? saving : courseEditor.isSaving;
  const showSuccess = success !== undefined ? success : !isSaving && !courseEditor.saveError;
  const showError = error !== undefined ? error : courseEditor.saveError;
  
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
    
    if (showSuccess || showError) {
      setVisible(true);
      
      if (showSuccess && autoHideSuccess) {
        // Store timer reference so we can clear it if needed
        timerRef.current = window.setTimeout(() => {
          if (isMounted.current) {
            setVisible(false);
            timerRef.current = null;
          }
        }, hideDelay);
      }
    } else {
      setVisible(false);
    }
  }, [showSuccess, showError, autoHideSuccess, hideDelay]);
  
  if (!visible) return null;
  
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
