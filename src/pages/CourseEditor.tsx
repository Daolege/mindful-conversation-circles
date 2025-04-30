import React from 'react';
import { useParams } from 'react-router-dom';
import { useCourseEditor } from '@/hooks/useCourseEditor';

const CourseEditor = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const numericCourseId = courseId ? parseInt(courseId) : undefined;
  
  // Fix: Passing only one argument to useCourseEditor instead of two
  const courseEditor = useCourseEditor(numericCourseId);
  
  if (courseEditor.loading) {
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

      <form onSubmit={courseEditor.handleSubmit}>
        <Tabs value={courseEditor.activeTab} onValueChange={courseEditor.setActiveTab} className="w-full">
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
                      value={courseEditor.formData.title}
                      onChange={courseEditor.handleChange}
                      required
                      placeholder="输入课程标题"
                    />
                  </div>
                  <div>
                    <Label htmlFor="level">课程难度</Label>
                    <Input
                      id="level"
                      name="level"
                      value={courseEditor.formData.level}
                      onChange={courseEditor.handleChange}
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">课程描述</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={courseEditor.formData.description}
                    onChange={courseEditor.handleChange}
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
                      value={courseEditor.formData.category}
                      onChange={courseEditor.handleChange}
                      placeholder="如: 技术、设计、管理"
                    />
                  </div>
                  <div>
                    <Label htmlFor="instructor">讲师名称</Label>
                    <Input
                      id="instructor"
                      name="instructor"
                      value={courseEditor.formData.instructor}
                      onChange={courseEditor.handleChange}
                      placeholder="讲师姓名"
                    />
                  </div>
                  <div>
                    <Label htmlFor="language">语言</Label>
                    <Input
                      id="language"
                      name="language"
                      value={courseEditor.formData.language}
                      onChange={courseEditor.handleChange}
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
                      value={courseEditor.formData.price}
                      onChange={courseEditor.handleChange}
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
                      value={courseEditor.formData.originalprice || ""}
                      onChange={courseEditor.handleChange}
                    />
                  </div>

                  <div>
                    <Label htmlFor="duration">课程时长</Label>
                    <Input
                      id="duration"
                      name="duration"
                      value={courseEditor.formData.duration}
                      onChange={courseEditor.handleChange}
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
                      value={courseEditor.formData.lectures}
                      onChange={courseEditor.handleChange}
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
                      value={courseEditor.formData.enrollment_count}
                      onChange={courseEditor.handleChange}
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
                      value={courseEditor.formData.display_order}
                      onChange={courseEditor.handleChange}
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
                      value={courseEditor.formData.video_url || ""}
                      onChange={courseEditor.handleChange}
                      placeholder="https://example.com/video.mp4"
                    />
                  </div>

                  <div>
                    <Label htmlFor="imageurl">课程封面图片</Label>
                    <Input
                      id="imageurl"
                      name="imageurl"
                      type="url"
                      value={courseEditor.formData.imageurl}
                      onChange={courseEditor.handleChange}
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="featured"
                    checked={courseEditor.formData.featured}
                    onCheckedChange={(checked) => 
                      courseEditor.setFormData(prev => ({ ...prev, featured: checked }))
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
                  {courseEditor.formData.syllabus.map((section, sectionIndex) => (
                    <Card key={sectionIndex} className="border">
                      <CardHeader className="pb-2">
                        {courseEditor.editingSection === sectionIndex ? (
                          <div className="flex gap-2">
                            <Input 
                              value={section.title}
                              onChange={(e) => courseEditor.updateSectionTitle(sectionIndex, e.target.value)}
                              placeholder="章节标题"
                            />
                            <Button 
                              type="button" 
                              variant="outline" 
                              onClick={() => courseEditor.setEditingSection(null)}
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
                                onClick={() => courseEditor.setEditingSection(sectionIndex)}
                              >
                                编辑
                              </Button>
                              <Button 
                                type="button" 
                                variant="destructive" 
                                size="sm"
                                onClick={() => courseEditor.removeSection(sectionIndex)}
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
                              {courseEditor.editingLecture && 
                               courseEditor.editingLecture.sectionIndex === sectionIndex && 
                               courseEditor.editingLecture.lectureIndex === lectureIndex ? (
                                <div className="flex flex-col sm:flex-row w-full gap-2">
                                  <Input 
                                    className="flex-grow"
                                    value={lecture.title}
                                    onChange={(e) => {
                                      const updatedLectures = [...courseEditor.formData.syllabus[sectionIndex].lectures];
                                      updatedLectures[lectureIndex] = {
                                        ...updatedLectures[lectureIndex],
                                        title: e.target.value
                                      };
                                      const updatedSyllabus = [...courseEditor.formData.syllabus];
                                      updatedSyllabus[sectionIndex].lectures = updatedLectures;
                                      courseEditor.setFormData({...courseEditor.formData, syllabus: updatedSyllabus});
                                    }}
                                    placeholder="课时标题"
                                  />
                                  <Input 
                                    className="w-32"
                                    value={lecture.duration}
                                    onChange={(e) => {
                                      const updatedLectures = [...courseEditor.formData.syllabus[sectionIndex].lectures];
                                      updatedLectures[lectureIndex] = {
                                        ...updatedLectures[lectureIndex],
                                        duration: e.target.value
                                      };
                                      const updatedSyllabus = [...courseEditor.formData.syllabus];
                                      updatedSyllabus[sectionIndex].lectures = updatedLectures;
                                      courseEditor.setFormData({...courseEditor.formData, syllabus: updatedSyllabus});
                                    }}
                                    placeholder="时长 (如: 10:30)"
                                  />
                                  <Button 
                                    type="button" 
                                    variant="outline"
                                    onClick={() => courseEditor.setEditingLecture(null)}
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
                                      onClick={() => courseEditor.setEditingLecture({sectionIndex, lectureIndex})}
                                    >
                                      编辑
                                    </Button>
                                    <Button 
                                      type="button" 
                                      variant="destructive" 
                                      size="sm"
                                      onClick={() => courseEditor.removeLecture(sectionIndex, lectureIndex)}
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
                                value={courseEditor.newLectureTitle}
                                onChange={(e) => courseEditor.setNewLectureTitle(e.target.value)}
                                placeholder="新课时标题"
                                className="flex-grow"
                              />
                              <Input 
                                value={courseEditor.newLectureDuration}
                                onChange={(e) => courseEditor.setNewLectureDuration(e.target.value)}
                                placeholder="时长 (如: 10:30)"
                                className="w-32"
                              />
                              <Button 
                                type="button" 
                                onClick={() => courseEditor.addLecture(sectionIndex)}
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
                    value={courseEditor.newSectionTitle}
                    onChange={(e) => courseEditor.setNewSectionTitle(e.target.value)}
                    placeholder="新章节标题"
                    className="flex-grow"
                  />
                  <Button 
                    type="button" 
                    onClick={courseEditor.addSection}
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
                  {courseEditor.formData.materials.map((material, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-md bg-gray-50">
                      {courseEditor.editingMaterial === index ? (
                        <div className="flex flex-col sm:flex-row w-full gap-2">
                          <Input 
                            className="flex-grow"
                            value={material.name}
                            onChange={(e) => {
                              const updatedMaterials = [...courseEditor.formData.materials];
                              updatedMaterials[index] = {
                                ...updatedMaterials[index],
                                name: e.target.value
                              };
                              courseEditor.setFormData({...courseEditor.formData, materials: updatedMaterials});
                            }}
                            placeholder="资料名称"
                          />
                          <Input 
                            className="flex-grow"
                            value={material.url}
                            onChange={(e) => {
                              const updatedMaterials = [...courseEditor.formData.materials];
                              updatedMaterials[index] = {
                                ...updatedMaterials[index],
                                url: e.target.value
                              };
                              courseEditor.setFormData({...courseEditor.formData, materials: updatedMaterials});
                            }}
                            placeholder="资料链接"
                          />
                          <Button 
                            type="button" 
                            variant="outline"
                            onClick={() => courseEditor.setEditingMaterial(null)}
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
                              onClick={() => courseEditor.setEditingMaterial(index)}
                            >
                              编辑
                            </Button>
                            <Button 
                              type="button" 
                              variant="destructive" 
                              size="sm"
                              onClick={() => courseEditor.removeMaterial(index)}
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
                    value={courseEditor.newMaterialName}
                    onChange={(e) => courseEditor.setNewMaterialName(e.target.value)}
                    placeholder="新资料名称"
                    className="flex-grow"
                  />
                  <Input 
                    value={courseEditor.newMaterialUrl}
                    onChange={(e) => courseEditor.setNewMaterialUrl(e.target.value)}
                    placeholder="资料链接"
                    className="flex-grow"
                  />
                  <Button 
                    type="button" 
                    onClick={courseEditor.addMaterial}
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
                    {courseEditor.formData.whatyouwilllearn.map((objective, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Input 
                          value={objective}
                          onChange={(e) => {
                            const updatedObjectives = [...courseEditor.formData.whatyouwilllearn];
                            updatedObjectives[index] = e.target.value;
                            courseEditor.setFormData({...courseEditor.formData, whatyouwilllearn: updatedObjectives});
                          }}
                          className="flex-grow"
                        />
                        <Button 
                          type="button" 
                          variant="destructive" 
                          size="icon"
                          onClick={() => courseEditor.removeObjective(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input 
                      value={courseEditor.newObjective}
                      onChange={(e) => courseEditor.setNewObjective(e.target.value)}
                      placeholder="新的学习目标"
                      className="flex-grow"
                    />
                    <Button 
                      type="button" 
                      onClick={courseEditor.addObjective}
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
                    {courseEditor.formData.requirements.map((requirement, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Input 
                          value={requirement}
                          onChange={(e) => {
                            const updatedRequirements = [...courseEditor.formData.requirements];
                            updatedRequirements[index] = e.target.value;
                            courseEditor.setFormData({...courseEditor.formData, requirements: updatedRequirements});
                          }}
                          className="flex-grow"
                        />
                        <Button 
                          type="button" 
                          variant="destructive" 
                          size="icon"
                          onClick={() => courseEditor.removeRequirement(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input 
                      value={courseEditor.newRequirement}
                      onChange={(e) => courseEditor.setNewRequirement(e.target.value)}
                      placeholder="新的学习前提"
                      className="flex-grow"
                    />
                    <Button 
                      type="button" 
                      onClick={courseEditor.addRequirement}
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
                    {courseEditor.formData.target_audience.map((audience, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Input 
                          value={audience}
                          onChange={(e) => {
                            const updatedAudience = [...courseEditor.formData.target_audience];
                            updatedAudience[index] = e.target.value;
                            courseEditor.setFormData({...courseEditor.formData, target_audience: updatedAudience});
                          }}
                          className="flex-grow"
                        />
                        <Button 
                          type="button" 
                          variant="destructive" 
                          size="icon"
                          onClick={() => courseEditor.removeAudienceItem(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input 
                      value={courseEditor.newAudienceItem}
                      onChange={(e) => courseEditor.setNewAudienceItem(e.target.value)}
                      placeholder="新的适合人群"
                      className="flex-grow"
                    />
                    <Button 
                      type="button" 
                      onClick={courseEditor.addAudienceItem}
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
                    {courseEditor.formData.highlights.map((highlight, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Input 
                          value={highlight}
                          onChange={(e) => {
                            const updatedHighlights = [...courseEditor.formData.highlights];
                            updatedHighlights[index] = e.target.value;
                            courseEditor.setFormData({...courseEditor.formData, highlights: updatedHighlights});
                          }}
                          className="flex-grow"
                        />
                        <Button 
                          type="button" 
                          variant="destructive" 
                          size="icon"
                          onClick={() => courseEditor.removeHighlight(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input 
                      value={courseEditor.newHighlight}
                      onChange={(e) => courseEditor.setNewHighlight(e.target.value)}
                      placeholder="新的课程亮点"
                      className="flex-grow"
                    />
                    <Button 
                      type="button" 
                      onClick={courseEditor.addHighlight}
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
          <Button type="submit" disabled={courseEditor.saving}>
            {courseEditor.saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {courseEditor.saving ? "保存中..." : "保存课程"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CourseEditor;
