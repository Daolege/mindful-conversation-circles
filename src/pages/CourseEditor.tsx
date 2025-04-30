import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { toast } from "sonner";
import type { Course, CourseSyllabusSection, CourseMaterial, Json } from "@/lib/types/course";
import { transformCourseData } from "@/lib/types/course";
import { saveCourse } from "@/lib/services/courseService";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2, Plus, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { v4 as uuidv4 } from 'uuid';

interface CourseFormData {
  title: string;
  description: string;
  price: number;
  originalprice: number | null;
  language: string;
  whatyouwilllearn: string[];
  requirements: string[];
  syllabus: CourseSyllabusSection[];
  materials: CourseMaterial[];
  display_order: number;
  enrollment_count: number;
  published_at: string;
  video_url: string | null;
  rating: number;
  ratingcount: number;
  studentcount: number;
  duration: string;
  lectures: number;
  level: string;
  lastupdated: string;
  featured: boolean;
  imageurl: string;
  target_audience: string[];
  category: string;
  instructor: string;
  highlights: string[];
}

const CourseEditor = () => {
  const { courseId } = useParams();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("basic");
  
  const [formData, setFormData] = useState<CourseFormData>({
    title: "",
    description: "",
    price: 0,
    originalprice: null,
    language: "zh",
    whatyouwilllearn: [],
    requirements: [],
    syllabus: [],
    materials: [],
    display_order: 999,
    enrollment_count: 0,
    published_at: new Date().toISOString(),
    video_url: null,
    rating: 0,
    ratingcount: 0,
    studentcount: 0,
    duration: "0h 0m",
    lectures: 0,
    level: "beginner",
    lastupdated: new Date().toISOString(),
    featured: false,
    imageurl: "",
    target_audience: [],
    category: "",
    instructor: "",
    highlights: []
  });

  const [newObjective, setNewObjective] = useState("");
  const [newRequirement, setNewRequirement] = useState("");
  const [newAudienceItem, setNewAudienceItem] = useState("");
  const [newHighlight, setNewHighlight] = useState("");
  
  const [newSectionTitle, setNewSectionTitle] = useState("");
  const [editingSection, setEditingSection] = useState<number | null>(null);
  const [newLectureTitle, setNewLectureTitle] = useState("");
  const [newLectureDuration, setNewLectureDuration] = useState("");
  const [editingLecture, setEditingLecture] = useState<{sectionIndex: number, lectureIndex: number} | null>(null);

  const [newMaterialName, setNewMaterialName] = useState("");
  const [newMaterialUrl, setNewMaterialUrl] = useState("");
  const [editingMaterial, setEditingMaterial] = useState<number | null>(null);

  useEffect(() => {
    if (courseId) {
      const loadCourseData = async () => {
        setLoading(true);
        try {
          console.log("Loading course with ID:", courseId);
          const { data, error } = await supabase
            .from("courses")
            .select("*")
            .eq("id", parseInt(courseId))
            .single();

          if (error) {
            console.error("Supabase error:", error);
            throw error;
          }

          if (data) {
            console.log("Raw course data from DB:", data);
            const course = transformCourseData(data);
            console.log("Transformed course data:", course);
            
            setFormData({
              title: course.title,
              description: course.description,
              price: course.price,
              originalprice: course.originalprice,
              language: course.language,
              whatyouwilllearn: Array.isArray(course.whatYouWillLearn) ? course.whatYouWillLearn : [],
              requirements: Array.isArray(course.requirements) ? course.requirements : [],
              syllabus: Array.isArray(course.syllabus) ? course.syllabus as CourseSyllabusSection[] : [],
              materials: Array.isArray(course.materials) ? course.materials as CourseMaterial[] : [],
              display_order: course.display_order,
              enrollment_count: course.enrollment_count,
              published_at: course.published_at,
              video_url: course.video_url,
              rating: course.rating,
              ratingcount: course.ratingCount || 0,
              studentcount: course.studentCount || 0,
              duration: course.duration,
              lectures: course.lectures,
              level: course.level,
              lastupdated: course.lastUpdated || new Date().toISOString(),
              featured: course.featured,
              imageurl: course.imageUrl || "",
              target_audience: Array.isArray(course.target_audience) ? course.target_audience : [],
              category: course.category || "",
              instructor: course.instructor || "",
              highlights: Array.isArray(course.highlights) ? course.highlights : []
            });
            console.log("Form data set:", formData);
          }
        } catch (error) {
          console.error("Error loading course:", error);
          toast({
            title: "错误",
            description: "加载课程数据失败",
            variant: "destructive",
          });
        } finally {
          setLoading(false);
        }
      };

      loadCourseData();
    }
  }, [courseId, toast]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "price" || name === "originalprice" || name === "display_order" || 
              name === "enrollment_count" || name === "rating" || name === "ratingcount" || 
              name === "studentcount" || name === "lectures"
        ? Number(value) || 0
        : name === "featured"
        ? value === "true"
        : value,
    }));
  };

  const addObjective = () => {
    if (newObjective.trim()) {
      setFormData(prev => ({
        ...prev,
        whatyouwilllearn: [...prev.whatyouwilllearn, newObjective.trim()]
      }));
      setNewObjective("");
    }
  };

  const removeObjective = (index: number) => {
    setFormData(prev => ({
      ...prev,
      whatyouwilllearn: prev.whatyouwilllearn.filter((_, i) => i !== index)
    }));
  };

  const addHighlight = () => {
    if (newHighlight.trim()) {
      setFormData(prev => ({
        ...prev,
        highlights: [...prev.highlights, newHighlight.trim()]
      }));
      setNewHighlight("");
    }
  };

  const removeHighlight = (index: number) => {
    setFormData(prev => ({
      ...prev,
      highlights: prev.highlights.filter((_, i) => i !== index)
    }));
  };

  const addRequirement = () => {
    if (newRequirement.trim()) {
      setFormData(prev => ({
        ...prev,
        requirements: [...prev.requirements, newRequirement.trim()]
      }));
      setNewRequirement("");
    }
  };

  const removeRequirement = (index: number) => {
    setFormData(prev => ({
      ...prev,
      requirements: prev.requirements.filter((_, i) => i !== index)
    }));
  };

  const addAudienceItem = () => {
    if (newAudienceItem.trim()) {
      setFormData(prev => ({
        ...prev,
        target_audience: [...prev.target_audience, newAudienceItem.trim()]
      }));
      setNewAudienceItem("");
    }
  };

  const removeAudienceItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      target_audience: prev.target_audience.filter((_, i) => i !== index)
    }));
  };

  const addSection = () => {
    if (newSectionTitle.trim()) {
      setFormData(prev => ({
        ...prev,
        syllabus: [
          ...prev.syllabus,
          {
            title: newSectionTitle.trim(),
            lectures: []
          }
        ]
      }));
      setNewSectionTitle("");
    }
  };

  const removeSection = (index: number) => {
    setFormData(prev => ({
      ...prev,
      syllabus: prev.syllabus.filter((_, i) => i !== index)
    }));
  };

  const updateSectionTitle = (index: number, title: string) => {
    const updatedSyllabus = [...formData.syllabus];
    updatedSyllabus[index].title = title;
    setFormData(prev => ({
      ...prev,
      syllabus: updatedSyllabus
    }));
  };

  const addLecture = (sectionIndex: number) => {
    if (newLectureTitle.trim() && newLectureDuration.trim()) {
      const updatedSyllabus = [...formData.syllabus];
      updatedSyllabus[sectionIndex].lectures.push({
        title: newLectureTitle.trim(),
        duration: newLectureDuration.trim()
      });
      setFormData(prev => ({
        ...prev,
        syllabus: updatedSyllabus
      }));
      setNewLectureTitle("");
      setNewLectureDuration("");
    }
  };

  const removeLecture = (sectionIndex: number, lectureIndex: number) => {
    const updatedSyllabus = [...formData.syllabus];
    updatedSyllabus[sectionIndex].lectures = updatedSyllabus[sectionIndex].lectures.filter(
      (_, i) => i !== lectureIndex
    );
    setFormData(prev => ({
      ...prev,
      syllabus: updatedSyllabus
    }));
  };

  const updateLecture = (sectionIndex: number, lectureIndex: number, title: string, duration: string) => {
    const updatedSyllabus = [...formData.syllabus];
    updatedSyllabus[sectionIndex].lectures[lectureIndex] = {
      ...updatedSyllabus[sectionIndex].lectures[lectureIndex],
      title,
      duration
    };
    setFormData(prev => ({
      ...prev,
      syllabus: updatedSyllabus
    }));
  };

  const addMaterial = () => {
    if (newMaterialName.trim() && newMaterialUrl.trim()) {
      setFormData(prev => ({
        ...prev,
        materials: [
          ...prev.materials,
          {
            id: uuidv4(),
            name: newMaterialName.trim(),
            url: newMaterialUrl.trim(),
            position: prev.materials.length,
            is_visible: true
          }
        ]
      }));
      setNewMaterialName("");
      setNewMaterialUrl("");
    }
  };

  const removeMaterial = (index: number) => {
    setFormData(prev => ({
      ...prev,
      materials: prev.materials.filter((_, i) => i !== index)
    }));
  };

  const updateMaterial = (index: number, name: string, url: string) => {
    const updatedMaterials = [...formData.materials];
    updatedMaterials[index] = { 
      ...updatedMaterials[index],
      name, 
      url 
    };
    setFormData(prev => ({
      ...prev,
      materials: updatedMaterials
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    console.log("Submitting form data:", formData);

    try {
      const courseData: Partial<Course> = {
        title: formData.title,
        description: formData.description,
        price: Number(formData.price),
        originalprice: formData.originalprice ? Number(formData.originalprice) : null,
        language: formData.language,
        imageurl: formData.imageurl,
        whatyouwilllearn: formData.whatyouwilllearn,
        requirements: formData.requirements,
        syllabus: formData.syllabus as unknown as any,
        materials: formData.materials as unknown as CourseMaterial[],
        display_order: Number(formData.display_order),
        enrollment_count: Number(formData.enrollment_count),
        published_at: formData.published_at,
        video_url: formData.video_url,
        rating: Number(formData.rating),
        ratingcount: Number(formData.ratingcount),
        studentcount: Number(formData.studentcount),
        duration: formData.duration,
        lectures: Number(formData.lectures),
        level: formData.level,
        lastupdated: formData.lastupdated,
        featured: formData.featured,
        target_audience: formData.target_audience,
        category: formData.category,
        instructor: formData.instructor,
        highlights: formData.highlights
      };

      console.log("Saving course data:", courseData);
      
      const courseIdParam = courseId ? parseInt(courseId) : undefined;
      const result = await saveCourse(courseData, courseIdParam);

      if (!result.success) {
        throw result.error;
      }

      toast({
        title: "成功",
        description: courseId ? "课程已更新" : "课程已创建",
      });

      navigate("/admin?tab=courses&operation=courseSaved");
    } catch (error) {
      console.error("Error saving course:", error);
      toast({
        title: "保存失败",
        description: "保存课程时发生错误",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-4 flex justify-center items-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">
        {courseId ? "编辑课程" : "创建新课程"}
      </h1>

      <form onSubmit={handleSubmit}>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="basic">基本信息</TabsTrigger>
            <TabsTrigger value="syllabus">课程大纲</TabsTrigger>
            <TabsTrigger value="materials">课程资料</TabsTrigger>
            <TabsTrigger value="details">详细内容</TabsTrigger>
            <TabsTrigger value="highlights">课程亮点</TabsTrigger>
          </TabsList>

          <TabsContent value="basic">
            <Card>
              <CardHeader>
                <CardTitle>基本信息</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="title">课程标题</Label>
                    <Input
                      id="title"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      required
                      placeholder="输入课程标题"
                    />
                  </div>
                  <div>
                    <Label htmlFor="level">课程难度</Label>
                    <Input
                      id="level"
                      name="level"
                      value={formData.level}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">课程描述</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    required
                    placeholder="输入课程描述"
                    rows={5}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="category">课程分类</Label>
                    <Input
                      id="category"
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      placeholder="如: 技术、设计、管理"
                    />
                  </div>
                  <div>
                    <Label htmlFor="instructor">讲师名称</Label>
                    <Input
                      id="instructor"
                      name="instructor"
                      value={formData.instructor}
                      onChange={handleChange}
                      placeholder="讲师姓名"
                    />
                  </div>
                  <div>
                    <Label htmlFor="language">语言</Label>
                    <Input
                      id="language"
                      name="language"
                      value={formData.language}
                      onChange={handleChange}
                      required
                      placeholder="zh"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="price">价格 (¥)</Label>
                    <Input
                      id="price"
                      name="price"
                      type="number"
                      min="0"
                      value={formData.price}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="originalprice">原价 (¥)</Label>
                    <Input
                      id="originalprice"
                      name="originalprice"
                      type="number"
                      min="0"
                      value={formData.originalprice || ""}
                      onChange={handleChange}
                    />
                  </div>

                  <div>
                    <Label htmlFor="duration">课程时长</Label>
                    <Input
                      id="duration"
                      name="duration"
                      value={formData.duration}
                      onChange={handleChange}
                      required
                      placeholder="如: 2h 30m"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="lectures">课时数量</Label>
                    <Input
                      id="lectures"
                      name="lectures"
                      type="number"
                      min="0"
                      value={formData.lectures}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="enrollment_count">报名人数</Label>
                    <Input
                      id="enrollment_count"
                      name="enrollment_count"
                      type="number"
                      min="0"
                      value={formData.enrollment_count}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="display_order">显示顺序</Label>
                    <Input
                      id="display_order"
                      name="display_order"
                      type="number"
                      min="0"
                      value={formData.display_order}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="video_url">课程视频链接</Label>
                    <Input
                      id="video_url"
                      name="video_url"
                      type="url"
                      value={formData.video_url || ""}
                      onChange={handleChange}
                      placeholder="https://example.com/video.mp4"
                    />
                  </div>

                  <div>
                    <Label htmlFor="imageurl">课程封面图片</Label>
                    <Input
                      id="imageurl"
                      name="imageurl"
                      type="url"
                      value={formData.imageurl}
                      onChange={handleChange}
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="featured"
                    checked={formData.featured}
                    onCheckedChange={(checked) => 
                      setFormData(prev => ({ ...prev, featured: checked }))
                    }
                  />
                  <Label htmlFor="featured">精选课程</Label>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="syllabus">
            <Card>
              <CardHeader>
                <CardTitle>课程大纲</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  {formData.syllabus.map((section, sectionIndex) => (
                    <Card key={sectionIndex} className="border">
                      <CardHeader className="pb-2">
                        {editingSection === sectionIndex ? (
                          <div className="flex gap-2">
                            <Input 
                              value={section.title}
                              onChange={(e) => updateSectionTitle(sectionIndex, e.target.value)}
                              placeholder="章节标题"
                            />
                            <Button 
                              type="button" 
                              variant="outline" 
                              onClick={() => setEditingSection(null)}
                            >
                              保存
                            </Button>
                          </div>
                        ) : (
                          <div className="flex justify-between items-center">
                            <CardTitle className="text-lg">{section.title}</CardTitle>
                            <div className="flex gap-2">
                              <Button 
                                type="button" 
                                variant="outline" 
                                size="sm"
                                onClick={() => setEditingSection(sectionIndex)}
                              >
                                编辑
                              </Button>
                              <Button 
                                type="button" 
                                variant="destructive" 
                                size="sm"
                                onClick={() => removeSection(sectionIndex)}
                              >
                                删除
                              </Button>
                            </div>
                          </div>
                        )}
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {section.lectures.map((lecture, lectureIndex) => (
                            <div key={lectureIndex} className="flex items-center justify-between p-3 border rounded-md bg-gray-50">
                              {editingLecture && 
                               editingLecture.sectionIndex === sectionIndex && 
                               editingLecture.lectureIndex === lectureIndex ? (
                                <div className="flex flex-col sm:flex-row w-full gap-2">
                                  <Input 
                                    className="flex-grow"
                                    value={lecture.title}
                                    onChange={(e) => {
                                      const updatedLectures = [...formData.syllabus[sectionIndex].lectures];
                                      updatedLectures[lectureIndex] = {
                                        ...updatedLectures[lectureIndex],
                                        title: e.target.value
                                      };
                                      const updatedSyllabus = [...formData.syllabus];
                                      updatedSyllabus[sectionIndex].lectures = updatedLectures;
                                      setFormData({...formData, syllabus: updatedSyllabus});
                                    }}
                                    placeholder="课时标题"
                                  />
                                  <Input 
                                    className="w-32"
                                    value={lecture.duration}
                                    onChange={(e) => {
                                      const updatedLectures = [...formData.syllabus[sectionIndex].lectures];
                                      updatedLectures[lectureIndex] = {
                                        ...updatedLectures[lectureIndex],
                                        duration: e.target.value
                                      };
                                      const updatedSyllabus = [...formData.syllabus];
                                      updatedSyllabus[sectionIndex].lectures = updatedLectures;
                                      setFormData({...formData, syllabus: updatedSyllabus});
                                    }}
                                    placeholder="时长 (如: 10:30)"
                                  />
                                  <Button 
                                    type="button" 
                                    variant="outline"
                                    onClick={() => setEditingLecture(null)}
                                  >
                                    保存
                                  </Button>
                                </div>
                              ) : (
                                <>
                                  <div>
                                    <span className="font-medium">{lecture.title}</span>
                                    <span className="ml-2 text-sm text-gray-500">{lecture.duration}</span>
                                  </div>
                                  <div className="flex gap-2">
                                    <Button 
                                      type="button" 
                                      variant="outline" 
                                      size="sm"
                                      onClick={() => setEditingLecture({sectionIndex, lectureIndex})}
                                    >
                                      编辑
                                    </Button>
                                    <Button 
                                      type="button" 
                                      variant="destructive" 
                                      size="sm"
                                      onClick={() => removeLecture(sectionIndex, lectureIndex)}
                                    >
                                      删除
                                    </Button>
                                  </div>
                                </>
                              )}
                            </div>
                          ))}
                          
                          <div className="mt-4 p-3 border rounded-md bg-gray-50">
                            <div className="flex flex-col sm:flex-row gap-2">
                              <Input 
                                value={newLectureTitle}
                                onChange={(e) => setNewLectureTitle(e.target.value)}
                                placeholder="新课时标题"
                                className="flex-grow"
                              />
                              <Input 
                                value={newLectureDuration}
                                onChange={(e) => setNewLectureDuration(e.target.value)}
                                placeholder="时长 (如: 10:30)"
                                className="w-32"
                              />
                              <Button 
                                type="button" 
                                onClick={() => addLecture(sectionIndex)}
                                className="whitespace-nowrap"
                              >
                                添加课时
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <div className="flex gap-2 mt-4">
                  <Input 
                    value={newSectionTitle}
                    onChange={(e) => setNewSectionTitle(e.target.value)}
                    placeholder="新章节标题"
                    className="flex-grow"
                  />
                  <Button 
                    type="button" 
                    onClick={addSection}
                    className="whitespace-nowrap"
                  >
                    添加章节
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="materials">
            <Card>
              <CardHeader>
                <CardTitle>课程资料</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  {formData.materials.map((material, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-md bg-gray-50">
                      {editingMaterial === index ? (
                        <div className="flex flex-col sm:flex-row w-full gap-2">
                          <Input 
                            className="flex-grow"
                            value={material.name}
                            onChange={(e) => {
                              const updatedMaterials = [...formData.materials];
                              updatedMaterials[index] = {
                                ...updatedMaterials[index],
                                name: e.target.value
                              };
                              setFormData({...formData, materials: updatedMaterials});
                            }}
                            placeholder="资料名称"
                          />
                          <Input 
                            className="flex-grow"
                            value={material.url}
                            onChange={(e) => {
                              const updatedMaterials = [...formData.materials];
                              updatedMaterials[index] = {
                                ...updatedMaterials[index],
                                url: e.target.value
                              };
                              setFormData({...formData, materials: updatedMaterials});
                            }}
                            placeholder="资料链接"
                          />
                          <Button 
                            type="button" 
                            variant="outline"
                            onClick={() => setEditingMaterial(null)}
                          >
                            保存
                          </Button>
                        </div>
                      ) : (
                        <>
                          <div>
                            <span className="font-medium">{material.name}</span>
                            <span className="block text-xs text-gray-500 truncate max-w-xs">{material.url}</span>
                          </div>
                          <div className="flex gap-2">
                            <Button 
                              type="button" 
                              variant="outline" 
                              size="sm"
                              onClick={() => setEditingMaterial(index)}
                            >
                              编辑
                            </Button>
                            <Button 
                              type="button" 
                              variant="destructive" 
                              size="sm"
                              onClick={() => removeMaterial(index)}
                            >
                              删除
                            </Button>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>

                <div className="flex flex-col sm:flex-row gap-2 mt-4">
                  <Input 
                    value={newMaterialName}
                    onChange={(e) => setNewMaterialName(e.target.value)}
                    placeholder="新资料名称"
                    className="flex-grow"
                  />
                  <Input 
                    value={newMaterialUrl}
                    onChange={(e) => setNewMaterialUrl(e.target.value)}
                    placeholder="资料链接"
                    className="flex-grow"
                  />
                  <Button 
                    type="button" 
                    onClick={addMaterial}
                    className="whitespace-nowrap"
                  >
                    添加资料
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="details">
            <Card>
              <CardHeader>
                <CardTitle>详细内容</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">学习目标</h3>
                  <div className="space-y-3 mb-4">
                    {formData.whatyouwilllearn.map((objective, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Input 
                          value={objective}
                          onChange={(e) => {
                            const updatedObjectives = [...formData.whatyouwilllearn];
                            updatedObjectives[index] = e.target.value;
                            setFormData({...formData, whatyouwilllearn: updatedObjectives});
                          }}
                          className="flex-grow"
                        />
                        <Button 
                          type="button" 
                          variant="destructive" 
                          size="icon"
                          onClick={() => removeObjective(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input 
                      value={newObjective}
                      onChange={(e) => setNewObjective(e.target.value)}
                      placeholder="新的学习目标"
                      className="flex-grow"
                    />
                    <Button 
                      type="button" 
                      onClick={addObjective}
                      className="whitespace-nowrap"
                    >
                      <Plus className="h-4 w-4 mr-1" /> 添加
                    </Button>
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="text-lg font-semibold mb-4">学习前提</h3>
                  <div className="space-y-3 mb-4">
                    {formData.requirements.map((requirement, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Input 
                          value={requirement}
                          onChange={(e) => {
                            const updatedRequirements = [...formData.requirements];
                            updatedRequirements[index] = e.target.value;
                            setFormData({...formData, requirements: updatedRequirements});
                          }}
                          className="flex-grow"
                        />
                        <Button 
                          type="button" 
                          variant="destructive" 
                          size="icon"
                          onClick={() => removeRequirement(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input 
                      value={newRequirement}
                      onChange={(e) => setNewRequirement(e.target.value)}
                      placeholder="新的学习前提"
                      className="flex-grow"
                    />
                    <Button 
                      type="button" 
                      onClick={addRequirement}
                      className="whitespace-nowrap"
                    >
                      <Plus className="h-4 w-4 mr-1" /> 添加
                    </Button>
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="text-lg font-semibold mb-4">适合人群</h3>
                  <div className="space-y-3 mb-4">
                    {formData.target_audience.map((audience, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Input 
                          value={audience}
                          onChange={(e) => {
                            const updatedAudience = [...formData.target_audience];
                            updatedAudience[index] = e.target.value;
                            setFormData({...formData, target_audience: updatedAudience});
                          }}
                          className="flex-grow"
                        />
                        <Button 
                          type="button" 
                          variant="destructive" 
                          size="icon"
                          onClick={() => removeAudienceItem(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input 
                      value={newAudienceItem}
                      onChange={(e) => setNewAudienceItem(e.target.value)}
                      placeholder="新的适合人群"
                      className="flex-grow"
                    />
                    <Button 
                      type="button" 
                      onClick={addAudienceItem}
                      className="whitespace-nowrap"
                    >
                      <Plus className="h-4 w-4 mr-1" /> 添加
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="highlights">
            <Card>
              <CardHeader>
                <CardTitle>课程亮点</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">课程亮点</h3>
                  <div className="space-y-3 mb-4">
                    {formData.highlights.map((highlight, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Input 
                          value={highlight}
                          onChange={(e) => {
                            const updatedHighlights = [...formData.highlights];
                            updatedHighlights[index] = e.target.value;
                            setFormData({...formData, highlights: updatedHighlights});
                          }}
                          className="flex-grow"
                        />
                        <Button 
                          type="button" 
                          variant="destructive" 
                          size="icon"
                          onClick={() => removeHighlight(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input 
                      value={newHighlight}
                      onChange={(e) => setNewHighlight(e.target.value)}
                      placeholder="新的课程亮点"
                      className="flex-grow"
                    />
                    <Button 
                      type="button" 
                      onClick={addHighlight}
                      className="whitespace-nowrap"
                    >
                      <Plus className="h-4 w-4 mr-1" /> 添加
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end space-x-4 mt-6">
          <Button 
            type="button" 
            variant="outline"
            onClick={() => navigate("/admin?tab=courses")}
          >
            取消
          </Button>
          <Button type="submit" disabled={saving}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {saving ? "保存中..." : "保存课程"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CourseEditor;
