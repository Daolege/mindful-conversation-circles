
import CourseNewEditorRefactored from "@/components/admin/CourseNewEditorRefactored";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/authHooks";
import { useNavigate, useSearchParams, useParams } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { getCourseNewById } from "@/lib/services/courseNewService";
import { CourseEditorProvider } from "@/components/admin/course-editor/CourseEditorContext";
import { getObjectives, getRequirements, getAudiences } from "@/lib/services/courseSettingsService";
import { runAllLanguageMigrations } from '@/lib/services/language/migrationService';

const CourseNewEditorPage = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const redirectAttemptedRef = useRef(false);
  const [searchParams] = useSearchParams();
  const tabParam = searchParams.get('tab');
  const params = useParams();
  const courseIdFromParams = params.courseId;
  const [courseExists, setCourseExists] = useState<boolean | null>(null);
  const [courseData, setCourseData] = useState<any>(null);
  const [sectionVisibility, setSectionVisibility] = useState({
    objectives: true, 
    requirements: true, 
    audiences: true,
    materials: false
  });
  const [savedSections, setSavedSections] = useState({
    objectives: false,
    requirements: false,
    audiences: false
  });
  const [loadedInitialState, setLoadedInitialState] = useState(false);
  // This state tracks database initialization
  const [dbInitialized, setDbInitialized] = useState(false);

  // ALL hooks MUST be called unconditionally at the top level
  // Admin check hook
  const { data: isAdmin, isLoading } = useQuery({
    queryKey: ['admin-role', user?.id],
    queryFn: async () => {
      if (!user) return false;
      
      try {
        const { data, error } = await supabase.rpc('has_role', { role: 'admin' });
        if (error) {
          console.error('[CourseNewEditorPage 调试] Error checking admin role:', error);
          return false;
        }
        return !!data;
      } catch (err) {
        console.error('[CourseNewEditorPage 调试] Error in admin role check:', err);
        return false;
      }
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    gcTime: 10 * 60 * 1000,
  });

  // Database initialization hook - ALWAYS called in same order
  useEffect(() => {
    const initializeDatabase = async () => {
      try {
        // Always attempt to run migrations regardless of user status
        console.log("[CourseNewEditorPage] Running language migrations");
        await runAllLanguageMigrations();
        setDbInitialized(true);
      } catch (err) {
        console.error("[CourseNewEditorPage] Error initializing database:", err);
        setDbInitialized(false);
      }
    };
    
    initializeDatabase();
  }, []);

  // Authentication redirection hook
  useEffect(() => {
    if (!isLoading && user && isAdmin === false && !redirectAttemptedRef.current) {
      redirectAttemptedRef.current = true;
      toast.error("权限不足", { description: "您没有管理员权限，无法访问课程编辑器" });
      navigate('/');
    }
  }, [isAdmin, isLoading, navigate, user]);
  
  // Check if the course exists when courseId is provided
  useEffect(() => {
    const checkCourseExists = async () => {
      if (courseIdFromParams && courseIdFromParams !== "new") {
        const numericCourseId = Number(courseIdFromParams);
        
        if (!isNaN(numericCourseId)) {
          try {
            console.log("[CourseNewEditorPage 调试] Checking if course exists:", numericCourseId);
            const { data, error } = await getCourseNewById(numericCourseId);
            
            if (error) {
              console.error("[CourseNewEditorPage 调试] Error getting course:", error);
              setCourseExists(false);
              return;
            }
            
            if (data) {
              console.log("[CourseNewEditorPage 调试] Course exists:", data);
              setCourseExists(true);
              setCourseData(data);
            } else {
              console.log("[CourseNewEditorPage 调试] Course does not exist");
              setCourseExists(false);
            }
          } catch (err) {
            console.error("[CourseNewEditorPage 调试] Error checking course:", err);
            setCourseExists(false);
          }
        } else {
          console.error("[CourseNewEditorPage 调试] Invalid course ID:", courseIdFromParams);
          setCourseExists(false);
        }
      } else if (courseIdFromParams === "new") {
        setCourseExists(null); // New course creation mode
      }
    };
    
    if (user && isAdmin) {
      checkCourseExists();
    }
  }, [courseIdFromParams, user, isAdmin]);
  
  // Debug logging hook
  useEffect(() => {
    console.log("[CourseNewEditorPage 调试] Component initialized");
    console.log("[CourseNewEditorPage 调试] URL params:", Object.fromEntries(searchParams.entries()));
    console.log("[CourseNewEditorPage 调试] URL path params:", params);
    console.log("[CourseNewEditorPage 调试] Current URL:", window.location.pathname + window.location.search);
    console.log("[CourseNewEditorPage 调试] Current courseId param:", courseIdFromParams);
    console.log("[CourseNewEditorPage 调试] courseId type:", typeof courseIdFromParams);
    console.log("[CourseNewEditorPage 调试] Course exists status:", courseExists);
    console.log("[CourseNewEditorPage 调试] Database initialized:", dbInitialized);
    
    if (tabParam) {
      console.log("[CourseNewEditorPage 调试] Tab param:", tabParam);
    }
    
    if (courseIdFromParams) {
      const numericCourseId = Number(courseIdFromParams);
      console.log("[CourseNewEditorPage 调试] Numeric course ID:", numericCourseId);
      console.log("[CourseNewEditorPage 调试] Is valid number:", !isNaN(numericCourseId));
    }
  }, [searchParams, tabParam, params, courseIdFromParams, courseExists, dbInitialized]);

  // Convert the courseId parameter to a number if it exists and is not "new"
  let numericCourseId = null;
  if (courseIdFromParams && courseIdFromParams !== "new") {
    numericCourseId = Number(courseIdFromParams);
    // If conversion results in NaN, set to null
    if (isNaN(numericCourseId)) {
      numericCourseId = null;
    }
  }

  // Load saved sections from localStorage on component mount
  useEffect(() => {
    if (numericCourseId && !loadedInitialState) {
      console.log(`[CourseNewEditorPage] Loading saved sections and visibility for courseId: ${numericCourseId}`);
      
      try {
        // Load saved sections status
        const savedSectionsStorageKey = `course_${numericCourseId}_saved_sections`;
        const savedSectionsData = JSON.parse(localStorage.getItem(savedSectionsStorageKey) || '{}');
        
        if (Object.keys(savedSectionsData).length > 0) {
          console.log(`[CourseNewEditorPage] Found saved sections in localStorage:`, savedSectionsData);
          setSavedSections({
            objectives: !!savedSectionsData.objectives,
            requirements: !!savedSectionsData.requirements,
            audiences: !!savedSectionsData.audiences
          });
        }
        
        // Load section visibility status
        const visibilityStorageKey = `course_${numericCourseId}_section_visibility`;
        const visibilityData = JSON.parse(localStorage.getItem(visibilityStorageKey) || '{}');
        
        if (Object.keys(visibilityData).length > 0) {
          console.log(`[CourseNewEditorPage] Found section visibility in localStorage:`, visibilityData);
          setSectionVisibility({
            objectives: visibilityData.objectives !== false,
            requirements: visibilityData.requirements !== false,
            audiences: visibilityData.audiences !== false,
            materials: visibilityData.materials === true // Default materials to hidden unless explicitly true
          });
        } else {
          // If no visibility data in localStorage, set default values
          setSectionVisibility({
            objectives: true,
            requirements: true,
            audiences: true,
            materials: false // Default materials to hidden
          });
        }
        
        setLoadedInitialState(true);
      } catch (err) {
        console.error('[CourseNewEditorPage] Error loading saved data from localStorage:', err);
      }
    }
  }, [numericCourseId, loadedInitialState]);
  
  // Load section visibility state from database if we don't have it in localStorage
  useEffect(() => {
    const loadInitialVisibilityFromDatabase = async () => {
      if (numericCourseId && loadedInitialState) {
        console.log(`[CourseNewEditorPage] Checking if database visibility data is needed`);
        
        try {
          // Check if we have visibility data in localStorage first
          const visibilityStorageKey = `course_${numericCourseId}_section_visibility`;
          let visibilityData = JSON.parse(localStorage.getItem(visibilityStorageKey) || '{}');
          
          // If we don't have complete visibility data, try to get it from the database
          if (!visibilityData.objectives && !visibilityData.requirements && !visibilityData.audiences) {
            console.log(`[CourseNewEditorPage] No complete visibility data in localStorage, fetching from database`);
            
            // Get visibility from database
            const [objectivesRes, requirementsRes, audiencesRes] = await Promise.all([
              getObjectives(numericCourseId),
              getRequirements(numericCourseId),
              getAudiences(numericCourseId)
            ]);
            
            // Update visibility state from database
            const newVisibility = { ...sectionVisibility };
            
            if (objectivesRes.data && objectivesRes.data.length > 0) {
              newVisibility.objectives = objectivesRes.data[0].is_visible !== false;
            }
            
            if (requirementsRes.data && requirementsRes.data.length > 0) {
              newVisibility.requirements = requirementsRes.data[0].is_visible !== false;
            }
            
            if (audiencesRes.data && audiencesRes.data.length > 0) {
              newVisibility.audiences = audiencesRes.data[0].is_visible !== false;
            }
            
            console.log(`[CourseNewEditorPage] Setting visibility from database:`, newVisibility);
            setSectionVisibility(newVisibility);
            
            // Save to localStorage for future use
            localStorage.setItem(visibilityStorageKey, JSON.stringify(newVisibility));
          }
        } catch (err) {
          console.error('[CourseNewEditorPage] Error fetching visibility from database:', err);
        }
      }
    };
    
    loadInitialVisibilityFromDatabase();
  }, [numericCourseId, loadedInitialState, sectionVisibility]);

  // Determine the course title to display
  const courseTitle = courseData?.title || (courseIdFromParams === "new" ? "创建新课程" : "");

  console.log("[CourseNewEditorPage 调试] Rendering with courseId:", courseIdFromParams, "numericCourseId:", numericCourseId);
  console.log("[CourseNewEditorPage 调试] Saved sections state:", savedSections);
  console.log("[CourseNewEditorPage 调试] Section visibility state:", sectionVisibility);
  console.log("[CourseNewEditorPage 调试] Loaded initial state:", loadedInitialState);

  if (loading || isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <Loader2 className="animate-spin h-6 w-6 text-primary" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-xl text-gray-600">只有管理员才能访问此页面</div>
        </div>
        <Footer />
      </div>
    );
  }

  // If we're checking a specific course and it doesn't exist
  if (courseIdFromParams !== "new" && courseExists === false) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow container mx-auto px-4 py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
            <h2 className="text-xl text-red-700 mb-2">课程不存在</h2>
            <p className="text-red-600 mb-4">您尝试访问的课程不存在或已被删除</p>
            <button 
              className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
              onClick={() => navigate('/admin?tab=courses-new')}
            >
              返回课程列表
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8">
        <CourseEditorProvider 
          value={{ 
            data: { 
              id: numericCourseId,
              title: courseData?.title,
              description: courseData?.description 
            },
            saving: false,
            hasChanges: false,
            saveError: null,
            savedSections: savedSections,
            sectionVisibility: sectionVisibility
          }}
        >
          <CourseNewEditorRefactored 
            initialCourseId={numericCourseId}
            initialActiveTab={tabParam || 'basic'}
            courseTitle={courseTitle}
            savedSections={savedSections}
            sectionVisibility={sectionVisibility}
          />
        </CourseEditorProvider>
      </main>
      <Footer />
    </div>
  );
};

export default CourseNewEditorPage;
