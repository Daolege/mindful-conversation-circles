
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Minus } from "lucide-react";
import { CourseSyllabusSection } from "@/lib/types/course";

interface BasicCourseFormProps {
  title: string;
  description: string;
  price: number;
  originalprice: number | null;
  language: string;
  whatyouwilllearn: string[];
  requirements: string[];
  syllabus: CourseSyllabusSection[];
  materials: { name: string; url: string }[];
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onArrayChange: (field: string, value: any[]) => void;
  onSelectChange?: (field: string, value: string) => void;
}

const languages = [
  { value: "zh", label: "中文" },
  { value: "en", label: "英语" },
  { value: "es", label: "西班牙语" },
  { value: "fr", label: "法语" },
  { value: "de", label: "德语" },
  { value: "ja", label: "日语" },
  { value: "ko", label: "韩语" },
  { value: "ru", label: "俄语" },
  { value: "ar", label: "阿拉伯语" },
  { value: "hi", label: "印地语" },
  { value: "pt", label: "葡萄牙语" },
  { value: "it", label: "意大利语" }
];

export function BasicCourseForm({
  title,
  description,
  price,
  originalprice,
  language,
  whatyouwilllearn,
  requirements,
  syllabus,
  materials,
  onChange,
  onArrayChange,
  onSelectChange,
}: BasicCourseFormProps) {
  const addArrayItem = (field: string, defaultValue: any) => {
    switch (field) {
      case 'whatyouwilllearn':
        onArrayChange('whatyouwilllearn', [...whatyouwilllearn, '']);
        break;
      case 'requirements':
        onArrayChange('requirements', [...requirements, '']);
        break;
      case 'materials':
        onArrayChange('materials', [...materials, { name: '', url: '' }]);
        break;
      case 'syllabus':
        onArrayChange('syllabus', [
          ...syllabus,
          {
            title: '',
            lectures: [{ title: '', duration: '0:00' }]
          }
        ]);
        break;
    }
  };

  const removeArrayItem = (field: string, index: number) => {
    switch (field) {
      case 'whatyouwilllearn':
        onArrayChange('whatyouwilllearn', whatyouwilllearn.filter((_, i) => i !== index));
        break;
      case 'requirements':
        onArrayChange('requirements', requirements.filter((_, i) => i !== index));
        break;
      case 'materials':
        onArrayChange('materials', materials.filter((_, i) => i !== index));
        break;
      case 'syllabus':
        onArrayChange('syllabus', syllabus.filter((_, i) => i !== index));
        break;
    }
  };

  const updateArrayItem = (field: string, index: number, value: any) => {
    switch (field) {
      case 'whatyouwilllearn':
        const newWhatYouWillLearn = [...whatyouwilllearn];
        newWhatYouWillLearn[index] = value;
        onArrayChange('whatyouwilllearn', newWhatYouWillLearn);
        break;
      case 'requirements':
        const newRequirements = [...requirements];
        newRequirements[index] = value;
        onArrayChange('requirements', newRequirements);
        break;
      case 'materials':
        const newMaterials = [...materials];
        newMaterials[index] = { ...newMaterials[index], ...value };
        onArrayChange('materials', newMaterials);
        break;
      case 'syllabus':
        const newSyllabus = [...syllabus];
        newSyllabus[index] = { ...newSyllabus[index], ...value };
        onArrayChange('syllabus', newSyllabus);
        break;
    }
  };

  const updateLecture = (sectionIndex: number, lectureIndex: number, value: any) => {
    const newSyllabus = [...syllabus];
    newSyllabus[sectionIndex].lectures[lectureIndex] = {
      ...newSyllabus[sectionIndex].lectures[lectureIndex],
      ...value
    };
    onArrayChange('syllabus', newSyllabus);
  };

  const addLecture = (sectionIndex: number) => {
    const newSyllabus = [...syllabus];
    newSyllabus[sectionIndex].lectures.push({ title: '', duration: '0:00' });
    onArrayChange('syllabus', newSyllabus);
  };

  const removeLecture = (sectionIndex: number, lectureIndex: number) => {
    const newSyllabus = [...syllabus];
    newSyllabus[sectionIndex].lectures = newSyllabus[sectionIndex].lectures.filter(
      (_, i) => i !== lectureIndex
    );
    onArrayChange('syllabus', newSyllabus);
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="title">课程标题</Label>
          <Input
            id="title"
            name="title"
            value={title}
            onChange={onChange}
            placeholder="输入课程标题"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="price">价格 (¥)</Label>
          <Input
            id="price"
            name="price"
            type="number"
            value={price}
            onChange={onChange}
            placeholder="0"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="originalprice">原价 (¥)</Label>
          <Input
            id="originalprice"
            name="originalprice"
            type="number"
            value={originalprice || ''}
            onChange={onChange}
            placeholder="0"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="language">课程语种</Label>
          <Select
            value={language}
            onValueChange={(value) => onSelectChange?.('language', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="选择课程语种" />
            </SelectTrigger>
            <SelectContent>
              {languages.map((lang) => (
                <SelectItem key={lang.value} value={lang.value}>
                  {lang.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">课程描述</Label>
        <Textarea
          id="description"
          name="description"
          value={description}
          onChange={onChange}
          placeholder="输入课程详细描述"
          rows={5}
        />
      </div>

      <div className="space-y-4">
        <div>
          <Label>学习目标</Label>
          {whatyouwilllearn.map((item, index) => (
            <div key={index} className="flex gap-2 mt-2">
              <Input
                value={item}
                onChange={(e) => updateArrayItem('whatyouwilllearn', index, e.target.value)}
                placeholder="输入学习目标"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => removeArrayItem('whatyouwilllearn', index)}
              >
                <Minus className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            className="mt-2"
            onClick={() => addArrayItem('whatyouwilllearn', '')}
          >
            <Plus className="h-4 w-4 mr-2" />
            添加学习目标
          </Button>
        </div>

        <div>
          <Label>课程要求</Label>
          {requirements.map((item, index) => (
            <div key={index} className="flex gap-2 mt-2">
              <Input
                value={item}
                onChange={(e) => updateArrayItem('requirements', index, e.target.value)}
                placeholder="输入课程要求"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => removeArrayItem('requirements', index)}
              >
                <Minus className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            className="mt-2"
            onClick={() => addArrayItem('requirements', '')}
          >
            <Plus className="h-4 w-4 mr-2" />
            添加课程要求
          </Button>
        </div>

        <div>
          <Label>课程大纲</Label>
          {syllabus.map((section, sectionIndex) => (
            <div key={sectionIndex} className="mt-4 p-4 border rounded-lg">
              <div className="flex gap-2 mb-4">
                <Input
                  value={section.title}
                  onChange={(e) =>
                    updateArrayItem('syllabus', sectionIndex, { ...section, title: e.target.value })
                  }
                  placeholder="章节标题"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => removeArrayItem('syllabus', sectionIndex)}
                >
                  <Minus className="h-4 w-4" />
                </Button>
              </div>

              {section.lectures.map((lecture, lectureIndex) => (
                <div key={lectureIndex} className="flex gap-2 mt-2">
                  <Input
                    value={lecture.title}
                    onChange={(e) =>
                      updateLecture(sectionIndex, lectureIndex, { title: e.target.value })
                    }
                    placeholder="课时标题"
                  />
                  <Input
                    value={lecture.duration}
                    onChange={(e) =>
                      updateLecture(sectionIndex, lectureIndex, { duration: e.target.value })
                    }
                    placeholder="时长 (如: 15:00)"
                    className="w-32"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => removeLecture(sectionIndex, lectureIndex)}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                </div>
              ))}

              <Button
                type="button"
                variant="outline"
                className="mt-2"
                onClick={() => addLecture(sectionIndex)}
              >
                <Plus className="h-4 w-4 mr-2" />
                添加课时
              </Button>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            className="mt-2"
            onClick={() => addArrayItem('syllabus', { title: '', lectures: [] })}
          >
            <Plus className="h-4 w-4 mr-2" />
            添加章节
          </Button>
        </div>

        <div>
          <Label>课程材料</Label>
          {materials.map((material, index) => (
            <div key={index} className="grid grid-cols-2 gap-2 mt-2">
              <Input
                value={material.name}
                onChange={(e) =>
                  updateArrayItem('materials', index, { ...material, name: e.target.value })
                }
                placeholder="材料名称"
              />
              <div className="flex gap-2">
                <Input
                  value={material.url}
                  onChange={(e) =>
                    updateArrayItem('materials', index, { ...material, url: e.target.value })
                  }
                  placeholder="材料链接"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => removeArrayItem('materials', index)}
                >
                  <Minus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            className="mt-2"
            onClick={() => addArrayItem('materials', { name: '', url: '' })}
          >
            <Plus className="h-4 w-4 mr-2" />
            添加材料
          </Button>
        </div>
      </div>
    </div>
  );
}
