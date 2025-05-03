
import React, { useEffect, useState } from 'react';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { EditableListComponent } from './EditableListComponent';
import { EditableCourseHighlightsComponent, CourseHighlight } from './EditableCourseHighlightsComponent';
import { EditableCourseEnrollmentGuideComponent, CourseEnrollmentGuide } from './EditableCourseEnrollmentGuideComponent';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ListItem } from '@/lib/types/course-new';
import { updateTable } from '@/lib/services/typeSafeSupabase';
import { getEnrollmentGuides, saveEnrollmentGuides } from '@/lib/services/courseEnrollmentGuideService';
import { 
  updateObjectivesVisibility, 
  updateRequirementsVisibility, 
  updateAudiencesVisibility, 
  saveMaterialsVisibility 
} from '@/lib/services/courseSettingsService';
import { EyeIcon, EyeOffIcon } from 'lucide-react';

// Define props for the CourseOtherSettings component
interface CourseOtherSettingsProps {
  courseId?: number;
  learningObjectives?: string[];
  requirements?: string[];
  targetAudience?: string[];
  onUpdate?: (field: string, value: any) => void;
  savedSections?: {
    objectives: boolean;
    requirements: boolean;
    audiences: boolean;
  };
  sectionVisibility?: {
    objectives: boolean;
    requirements: boolean;
    audiences: boolean;
    materials: boolean;
  };
}

export const CourseOtherSettings: React.FC<CourseOtherSettingsProps> = ({
  courseId,
  learningObjectives = [],
  requirements = [],
  targetAudience = [],
  onUpdate,
  savedSections = {
    objectives: false,
    requirements: false,
    audiences: false
  },
  sectionVisibility = {
    objectives: true,
    requirements: true,
    audiences: true,
    materials: false
  },
}) => {
  // Purchase method states
  const [allowsOneTimePurchase, setAllowsOneTimePurchase] = useState<boolean>(true);
  const [allowsSubscription, setAllowsSubscription] = useState<boolean>(true);
  const [purchaseMethodError, setPurchaseMethodError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  // Course visibility state - Changed default to "draft" instead of "published"
  const [courseVisibility, setCourseVisibility] = useState<string>('draft');
  
  // Section visibility states
  const [objectivesVisible, setObjectivesVisible] = useState<boolean>(sectionVisibility.objectives);
  const [requirementsVisible, setRequirementsVisible] = useState<boolean>(sectionVisibility.requirements);
  const [audiencesVisible, setAudiencesVisible] = useState<boolean>(sectionVisibility.audiences);
  const [materialsVisible, setMaterialsVisible] = useState<boolean>(sectionVisibility.materials);
  
  // State for editable section titles
  const [sectionTitles, setSectionTitles] = useState({
    objectives: "学习目标",
    requirements: "课程要求",
    audience: "适合人群"
  });
  
  // Course highlights state
  const [courseHighlights, setCourseHighlights] = useState<CourseHighlight[]>([]);
  const [lectureCount, setLectureCount] = useState<number>(0);
  const [courseLanguage, setCourseLanguage] = useState<string>("中文");
  
  // Course enrollment guides state
  const [enrollmentGuides, setEnrollmentGuides] = useState<CourseEnrollmentGuide[]>([]);
  
  // Convert string arrays to object arrays with IDs for the editable lists
  const formatArrayToListItems = (arr: string[]): ListItem[] => {
    return arr.map((item, index) => ({
      id: `item-${index}`,
      text: item,
      position: index,
      is_visible: true
    }));
  };

  const [learningObjectivesList, setLearningObjectivesList] = useState<ListItem[]>(
    formatArrayToListItems(learningObjectives)
  );
  const [requirementsList, setRequirementsList] = useState<ListItem[]>(
    formatArrayToListItems(requirements)
  );
  const [targetAudienceList, setTargetAudienceList] = useState<ListItem[]>(
    formatArrayToListItems(targetAudience)
  );

  // Load course information
  useEffect(() => {
    async function loadCourseSettings() {
      if (!courseId) return;
      
      setIsLoading(true);
      try {
        // Load basic course settings
        const { data, error } = await supabase
          .from('courses_new')
          .select('status, allows_one_time_purchase, allows_subscription, language, lecture_count')
          .eq('id', courseId)
          .single();

        if (error) throw error;

        if (data) {
          setCourseVisibility(data.status || "draft"); // Set default as draft if not specified
          // Set purchase method states with defaults if fields are null
          setAllowsOneTimePurchase(data.allows_one_time_purchase !== false);
          setAllowsSubscription(data.allows_subscription !== false);
          setCourseLanguage(data.language || "中文");
          setLectureCount(data.lecture_count || 0);
        }
        
        // Load course highlights
        const { data: highlightsData, error: highlightsError } = await supabase
          .from('course_highlights')
          .select('*')
          .eq('course_id', courseId)
          .order('position');
          
        if (highlightsError) throw highlightsError;
        
        if (highlightsData && highlightsData.length > 0) {
          setCourseHighlights(highlightsData);
        } else {
          // If no highlights exist, copy from defaults
          const { data: defaultHighlights, error: defaultError } = await supabase
            .from('default_course_highlights')
            .select('*')
            .order('position');
            
          if (!defaultError && defaultHighlights) {
            // Transform default highlights for this course
            const courseSpecificHighlights = defaultHighlights.map(item => ({
              ...item,
              id: `temp-${Date.now()}-${item.position}`,
              course_id: courseId
            }));
            
            setCourseHighlights(courseSpecificHighlights);
          }
        }
        
        // Load course enrollment guides
        const { data: guidesData, error: guidesError } = await getEnrollmentGuides(courseId);
        
        if (!guidesError && guidesData) {
          setEnrollmentGuides(guidesData);
        }
      } catch (error: any) {
        console.error("Error loading course settings:", error);
        toast.error("无法加载课程设置");
      } finally {
        setIsLoading(false);
      }
    }

    loadCourseSettings();
  }, [courseId]);

  // Initialize section visibility states from props
  useEffect(() => {
    if (sectionVisibility) {
      setObjectivesVisible(sectionVisibility.objectives);
      setRequirementsVisible(sectionVisibility.requirements);
      setAudiencesVisible(sectionVisibility.audiences);
      setMaterialsVisible(sectionVisibility.materials);
    }
  }, [sectionVisibility]);

  // Convert list items back to string arrays for saving
  const formatListItemsToArray = (items: ListItem[]): string[] => {
    return items.map(item => item.text);
  };

  // Handle course highlights changes
  const handleCourseHighlightsChange = async (newHighlights: CourseHighlight[]) => {
    setCourseHighlights(newHighlights);
    
    if (!courseId) return;
    
    try {
      // First delete all existing highlights for this course
      const { error: deleteError } = await supabase
        .from('course_highlights')
        .delete()
        .eq('course_id', courseId);
        
      if (deleteError) throw deleteError;
      
      // Then insert the new highlights
      const highlightsToInsert = newHighlights.map((highlight, index) => ({
        icon: highlight.icon,
        content: highlight.content,
        position: index,
        is_visible: highlight.is_visible,
        course_id: courseId
      }));
      
      const { error: insertError } = await supabase
        .from('course_highlights')
        .insert(highlightsToInsert);
        
      if (insertError) throw insertError;
      
      toast.success("课程亮点已更新");
    } catch (error) {
      console.error("Error saving course highlights:", error);
      toast.error("保存课程亮点失败");
    }
  };

  // Handle enrollment guides changes
  const handleEnrollmentGuidesChange = async (newGuides: CourseEnrollmentGuide[]) => {
    setEnrollmentGuides(newGuides);
    
    if (!courseId) return;
    
    try {
      const { error } = await saveEnrollmentGuides(courseId, newGuides);
      
      if (error) throw error;
      
      toast.success("报名后引导已更新");
    } catch (error) {
      console.error("Error saving enrollment guides:", error);
      toast.error("保存报名后引导失败");
    }
  };

  const handleLearningObjectivesChange = (newItems: ListItem[]) => {
    setLearningObjectivesList(newItems);
    if (onUpdate) {
      onUpdate('learning_objectives', formatListItemsToArray(newItems));
    }
  };

  const handleRequirementsChange = (newItems: ListItem[]) => {
    setRequirementsList(newItems);
    if (onUpdate) {
      onUpdate('requirements', formatListItemsToArray(newItems));
    }
  };

  const handleTargetAudienceChange = (newItems: ListItem[]) => {
    setTargetAudienceList(newItems);
    if (onUpdate) {
      onUpdate('target_audience', formatListItemsToArray(newItems));
    }
  };

  const handleVisibilityChange = async (value: string) => {
    setCourseVisibility(value);
    if (courseId) {
      try {
        const { error } = await updateTable('courses_new', { status: value }, { id: courseId });
        
        if (error) {
          console.error("Error updating course visibility:", error);
          toast.error("更新课程可见性失败");
          return;
        }
        
        toast.success("课程可见性已更新");
      } catch (err) {
        console.error("Error updating course visibility:", err);
        toast.error("更新课程可见性失败");
      }
    }
  };

  // Handle section visibility toggle
  const handleSectionVisibilityChange = async (section: 'objectives' | 'requirements' | 'audiences' | 'materials', isVisible: boolean) => {
    if (!courseId) return;
    
    try {
      let result;
      
      // Update state based on section
      switch(section) {
        case 'objectives':
          setObjectivesVisible(isVisible);
          result = await updateObjectivesVisibility(courseId, isVisible);
          break;
        case 'requirements':
          setRequirementsVisible(isVisible);
          result = await updateRequirementsVisibility(courseId, isVisible);
          break;
        case 'audiences':
          setAudiencesVisible(isVisible);
          result = await updateAudiencesVisibility(courseId, isVisible);
          break;
        case 'materials':
          setMaterialsVisible(isVisible);
          result = await saveMaterialsVisibility(courseId, isVisible);
          break;
      }
      
      if (result && !result.error) {
        const sectionNames: Record<string, string> = {
          objectives: '学习目标',
          requirements: '课程要求',
          audiences: '适合人群',
          materials: '课程附件'
        };
        
        toast.success(`${sectionNames[section]}${isVisible ? '已显示' : '已隐藏'}`);
        
        // Update localStorage
        const visibilityKey = `course_${courseId}_section_visibility`;
        const currentVisibility = JSON.parse(localStorage.getItem(visibilityKey) || '{}');
        currentVisibility[section] = isVisible;
        localStorage.setItem(visibilityKey, JSON.stringify(currentVisibility));
      }
    } catch (err) {
      console.error(`Error updating ${section} visibility:`, err);
      toast.error(`更新${section === 'objectives' ? '学习目标' : 
                    section === 'requirements' ? '课程要求' : 
                    section === 'audiences' ? '适合人群' : '课程附件'}可见性失败`);
    }
  };

  const handleSectionTitleChange = (section: string, title: string) => {
    setSectionTitles(prev => ({
      ...prev,
      [section]: title
    }));
    // Note: We're only changing the UI display, not saving these titles to the backend
  };
  
  const handlePurchaseMethodChange = async (type: 'one_time' | 'subscription', checked: boolean) => {
    // Update local state based on checkbox type
    if (type === 'one_time') {
      setAllowsOneTimePurchase(checked);
      
      // If trying to uncheck when subscription is also unchecked
      if (!checked && !allowsSubscription) {
        setAllowsOneTimePurchase(true); // Force keep checked
        setPurchaseMethodError("必须至少选择一种购买方式");
        return;
      }
    } else {
      setAllowsSubscription(checked);
      
      // If trying to uncheck when one-time is also unchecked
      if (!checked && !allowsOneTimePurchase) {
        setAllowsSubscription(true); // Force keep checked
        setPurchaseMethodError("必须至少选择一种购买方式");
        return;
      }
    }
    
    // Clear error if we have at least one option selected
    if ((type === 'one_time' && checked) || (type === 'subscription' && checked) || 
       (type === 'one_time' && !checked && allowsSubscription) || 
       (type === 'subscription' && !checked && allowsOneTimePurchase)) {
      setPurchaseMethodError(null);
    }
    
    // Save to database if courseId is available
    if (courseId) {
      try {
        const field = type === 'one_time' ? 'allows_one_time_purchase' : 'allows_subscription';
        const updateData = { [field]: checked };
        
        const { error } = await updateTable('courses_new', updateData, { id: courseId });
          
        if (error) {
          console.error(`Error updating ${field}:`, error);
          toast.error(`更新购买方式失败`);
          // Revert the state change if there was an error
          if (type === 'one_time') {
            setAllowsOneTimePurchase(!checked);
          } else {
            setAllowsSubscription(!checked);
          }
        } else {
          toast.success("购买方式已更新");
        }
      } catch (error) {
        console.error(`Error updating purchase method:`, error);
        toast.error(`更新购买方式失败`);
      }
    }
  };

  return (
    <div className="space-y-8 py-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>课程可见性</CardTitle>
          </CardHeader>
          <CardContent>
            <RadioGroup 
              value={courseVisibility}
              onValueChange={handleVisibilityChange}
              className="flex flex-col space-y-2 mt-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="published" id="published" />
                <Label htmlFor="published">已发布 - 所有用户可见</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="draft" id="draft" />
                <Label htmlFor="draft">草稿 - 仅管理员可见</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="archived" id="archived" />
                <Label htmlFor="archived">已归档 - 不显示在课程列表</Label>
              </div>
            </RadioGroup>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>购买方式</CardTitle>
            <CardDescription>选择课程支持的购买方式（至少选择一项）</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="oneTimePurchase" 
                  checked={allowsOneTimePurchase} 
                  onCheckedChange={(checked) => handlePurchaseMethodChange('one_time', checked === true)}
                />
                <Label htmlFor="oneTimePurchase" className="font-medium">
                  单次购买
                </Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="subscription" 
                  checked={allowsSubscription} 
                  onCheckedChange={(checked) => handlePurchaseMethodChange('subscription', checked === true)}
                />
                <Label htmlFor="subscription" className="font-medium">
                  订阅计划
                </Label>
              </div>
              
              {purchaseMethodError && (
                <div className="text-sm text-red-500">{purchaseMethodError}</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Section Visibility Toggles */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>课程章节显示设置</CardTitle>
          <CardDescription>控制课程详情页面各个章节的可见性</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h3 className="font-medium">学习目标</h3>
                <p className="text-sm text-gray-500">控制学习目标章节在课程详情页的显示</p>
              </div>
              <div className="flex items-center gap-2">
                {objectivesVisible ? <EyeIcon size={16} className="text-green-500" /> : <EyeOffIcon size={16} className="text-gray-400" />}
                <Switch
                  checked={objectivesVisible}
                  onCheckedChange={(checked) => handleSectionVisibilityChange('objectives', checked)}
                />
              </div>
            </div>
            
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h3 className="font-medium">课程要求</h3>
                <p className="text-sm text-gray-500">控制课程要求章节在课程详情页的显示</p>
              </div>
              <div className="flex items-center gap-2">
                {requirementsVisible ? <EyeIcon size={16} className="text-green-500" /> : <EyeOffIcon size={16} className="text-gray-400" />}
                <Switch
                  checked={requirementsVisible}
                  onCheckedChange={(checked) => handleSectionVisibilityChange('requirements', checked)}
                />
              </div>
            </div>
            
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h3 className="font-medium">适合人群</h3>
                <p className="text-sm text-gray-500">控制适合人群章节在课程详情页的显示</p>
              </div>
              <div className="flex items-center gap-2">
                {audiencesVisible ? <EyeIcon size={16} className="text-green-500" /> : <EyeOffIcon size={16} className="text-gray-400" />}
                <Switch
                  checked={audiencesVisible}
                  onCheckedChange={(checked) => handleSectionVisibilityChange('audiences', checked)}
                />
              </div>
            </div>
            
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h3 className="font-medium">课程附件</h3>
                <p className="text-sm text-gray-500">控制课程附件章节在课程详情页的显示</p>
              </div>
              <div className="flex items-center gap-2">
                {materialsVisible ? <EyeIcon size={16} className="text-green-500" /> : <EyeOffIcon size={16} className="text-gray-400" />}
                <Switch
                  checked={materialsVisible}
                  onCheckedChange={(checked) => handleSectionVisibilityChange('materials', checked)}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Course settings layout - split into two columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left column with Course Highlights */}
        <div className="space-y-6">
          <EditableCourseHighlightsComponent 
            courseId={courseId}
            highlights={courseHighlights}
            onChange={handleCourseHighlightsChange}
            lectureCount={lectureCount}
            courseLanguage={courseLanguage}
          />

          <EditableCourseEnrollmentGuideComponent
            courseId={courseId}
            guides={enrollmentGuides}
            onChange={handleEnrollmentGuidesChange}
          />
        </div>
        
        {/* Right column with editable lists */}
        <div className="space-y-6">
          <EditableListComponent
            title={sectionTitles.objectives}
            titleEditable={true}
            onTitleChange={(title) => handleSectionTitleChange('objectives', title)}
            description="列出学习者完成课程后将获得的技能"
            items={learningObjectivesList}
            onChange={handleLearningObjectivesChange}
            placeholder="例如: 掌握基础Python语法"
            isVisible={objectivesVisible}
            onVisibilityChange={(visible) => handleSectionVisibilityChange('objectives', visible)}
          />

          <EditableListComponent
            title={sectionTitles.requirements}
            titleEditable={true}
            onTitleChange={(title) => handleSectionTitleChange('requirements', title)}
            description="列出参加课程所需的先决条件"
            items={requirementsList}
            onChange={handleRequirementsChange}
            placeholder="例如: 基本计算机操作技能"
            isVisible={requirementsVisible}
            onVisibilityChange={(visible) => handleSectionVisibilityChange('requirements', visible)}
          />

          <EditableListComponent
            title={sectionTitles.audience}
            titleEditable={true}
            onTitleChange={(title) => handleSectionTitleChange('audience', title)}
            description="说明这门课程适合哪类学习者"
            items={targetAudienceList}
            onChange={handleTargetAudienceChange}
            placeholder="例如: 初学者, 想转行的专业人士"
            isVisible={audiencesVisible}
            onVisibilityChange={(visible) => handleSectionVisibilityChange('audiences', visible)}
          />
        </div>
      </div>
    </div>
  );
};
