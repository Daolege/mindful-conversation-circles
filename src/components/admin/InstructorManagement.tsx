import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Search, Filter, Loader2, Plus, Pencil, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Instructor, InstructorFormData } from "@/lib/types/instructor";
import { handleInstructorsQueryError } from "@/lib/supabaseUtils";

export const InstructorManagement = () => {
  const queryClient = useQueryClient();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentInstructor, setCurrentInstructor] = useState<Instructor | null>(null);
  const [newInstructor, setNewInstructor] = useState<InstructorFormData>({
    name: "",
    email: "",
    bio: "",
    expertise: "",
    avatar_url: "",
    status: "active"
  });

  const { data: instructors, isLoading, refetch } = useQuery({
    queryKey: ["admin-instructors", statusFilter, searchQuery],
    queryFn: async () => {
      let query = supabase
        .from("instructors")
        .select("*");

      if (statusFilter !== "all") {
        query = query.eq("status", statusFilter as any);
      }

      if (searchQuery) {
        query = query.or(`name.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%`);
      }

      const { data, error } = await query.order("name");
      
      return handleInstructorsQueryError(data, error);
    },
    refetchOnWindowFocus: false,
  });

  const handleAddInstructor = async () => {
    try {
      const { error } = await supabase
        .from("instructors")
        .insert([newInstructor as any]);

      if (error) throw error;

      toast.success("讲师添加成功");
      setIsAddDialogOpen(false);
      setNewInstructor({
        name: "",
        email: "",
        bio: "",
        expertise: "",
        avatar_url: "",
        status: "active",
      });
      queryClient.invalidateQueries({ queryKey: ["admin-instructors"] });
    } catch (error: any) {
      console.error("Error adding instructor:", error);
      toast.error("添加讲师失败: " + (error.message || "未知错误"));
    }
  };

  const handleUpdateInstructor = async () => {
    if (!currentInstructor) return;

    try {
      const { error } = await supabase
        .from("instructors")
        .update({
          name: currentInstructor.name,
          email: currentInstructor.email,
          bio: currentInstructor.bio,
          expertise: currentInstructor.expertise,
          avatar_url: currentInstructor.avatar_url,
          status: currentInstructor.status
        } as any)
        .eq("id", currentInstructor.id as any);

      if (error) throw error;

      toast.success("讲师信息已更新");
      setIsEditDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ["admin-instructors"] });
    } catch (error: any) {
      console.error("Error updating instructor:", error);
      toast.error("更新讲师信息失败: " + (error.message || "未知错误"));
    }
  };

  const handleDeleteInstructor = async () => {
    if (!currentInstructor) return;

    try {
      const { error } = await supabase
        .from("instructors")
        .delete()
        .eq("id", currentInstructor.id as any);

      if (error) throw error;

      toast.success("讲师已删除");
      setIsDeleteDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ["admin-instructors"] });
    } catch (error: any) {
      console.error("Error deleting instructor:", error);
      toast.error("删除讲师失败: " + (error.message || "未知错误"));
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">讲师管理</h2>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <Input
              type="text"
              placeholder="搜索讲师..."
              className="pl-10 pr-4 w-64"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select
              value={statusFilter}
              onValueChange={setStatusFilter}
            >
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="选择状态" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部</SelectItem>
                <SelectItem value="active">活跃</SelectItem>
                <SelectItem value="inactive">未活跃</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-knowledge-primary hover:bg-knowledge-secondary text-white">
                <Plus className="h-4 w-4 mr-2" />
                添加讲师
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>添加新讲师</DialogTitle>
                <DialogDescription>
                  请填写新讲师的详细信息。
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">姓名</Label>
                  <Input
                    id="name"
                    value={newInstructor.name}
                    onChange={(e) => setNewInstructor({ ...newInstructor, name: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">电子邮箱</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newInstructor.email}
                    onChange={(e) => setNewInstructor({ ...newInstructor, email: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="bio">简介</Label>
                  <Textarea
                    id="bio"
                    rows={3}
                    value={newInstructor.bio}
                    onChange={(e) => setNewInstructor({ ...newInstructor, bio: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="expertise">专长领域</Label>
                  <Input
                    id="expertise"
                    value={newInstructor.expertise}
                    onChange={(e) => setNewInstructor({ ...newInstructor, expertise: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="avatar_url">头像URL</Label>
                  <Input
                    id="avatar_url"
                    value={newInstructor.avatar_url}
                    onChange={(e) => setNewInstructor({ ...newInstructor, avatar_url: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="status">状态</Label>
                  <Select
                    value={newInstructor.status}
                    onValueChange={(value) => setNewInstructor({ ...newInstructor, status: value as 'active' | 'inactive' })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="选择状态" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">活跃</SelectItem>
                      <SelectItem value="inactive">未活跃</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>取消</Button>
                <Button onClick={handleAddInstructor}>添加</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="h-8 w-8 animate-spin text-knowledge-primary" />
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>讲师</TableHead>
              <TableHead>电子邮箱</TableHead>
              <TableHead>专长领域</TableHead>
              <TableHead>状态</TableHead>
              <TableHead>加入时间</TableHead>
              <TableHead>操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {instructors?.map((instructor) => (
              <TableRow key={instructor.id}>
                <TableCell>
                  <div className="flex items-center space-x-3">
                    <Avatar>
                      <AvatarImage src={instructor.avatar_url || ''} />
                      <AvatarFallback>{instructor.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <span>{instructor.name}</span>
                  </div>
                </TableCell>
                <TableCell>{instructor.email}</TableCell>
                <TableCell>{instructor.expertise}</TableCell>
                <TableCell>
                  <Badge variant={instructor.status === "active" ? "outline" : "secondary"}>
                    {instructor.status === "active" ? "活跃" : "未活跃"}
                  </Badge>
                </TableCell>
                <TableCell>
                  {instructor.created_at ? new Date(instructor.created_at).toLocaleDateString() : '-'}
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Dialog open={isEditDialogOpen && currentInstructor?.id === instructor.id} onOpenChange={(open) => !open && setCurrentInstructor(null)}>
                      <DialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            setCurrentInstructor(instructor);
                            setIsEditDialogOpen(true);
                          }}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-md">
                        <DialogHeader>
                          <DialogTitle>编辑讲师信息</DialogTitle>
                          <DialogDescription>
                            更新讲师的详细信息。
                          </DialogDescription>
                        </DialogHeader>
                        {currentInstructor && (
                          <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                              <Label htmlFor="edit-name">姓名</Label>
                              <Input
                                id="edit-name"
                                value={currentInstructor.name}
                                onChange={(e) => setCurrentInstructor({ ...currentInstructor, name: e.target.value })}
                              />
                            </div>
                            <div className="grid gap-2">
                              <Label htmlFor="edit-email">电子邮箱</Label>
                              <Input
                                id="edit-email"
                                type="email"
                                value={currentInstructor.email}
                                onChange={(e) => setCurrentInstructor({ ...currentInstructor, email: e.target.value })}
                              />
                            </div>
                            <div className="grid gap-2">
                              <Label htmlFor="edit-bio">简介</Label>
                              <Textarea
                                id="edit-bio"
                                rows={3}
                                value={currentInstructor.bio || ''}
                                onChange={(e) => setCurrentInstructor({ ...currentInstructor, bio: e.target.value })}
                              />
                            </div>
                            <div className="grid gap-2">
                              <Label htmlFor="edit-expertise">专长领域</Label>
                              <Input
                                id="edit-expertise"
                                value={currentInstructor.expertise || ''}
                                onChange={(e) => setCurrentInstructor({ ...currentInstructor, expertise: e.target.value })}
                              />
                            </div>
                            <div className="grid gap-2">
                              <Label htmlFor="edit-avatar">头像URL</Label>
                              <Input
                                id="edit-avatar"
                                value={currentInstructor.avatar_url || ''}
                                onChange={(e) => setCurrentInstructor({ ...currentInstructor, avatar_url: e.target.value })}
                              />
                            </div>
                            <div className="grid gap-2">
                              <Label htmlFor="edit-status">状态</Label>
                              <Select
                                value={currentInstructor.status}
                                onValueChange={(value) => setCurrentInstructor({ ...currentInstructor, status: value as 'active' | 'inactive' })}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="选择状态" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="active">活跃</SelectItem>
                                  <SelectItem value="inactive">未活跃</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        )}
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>取消</Button>
                          <Button onClick={handleUpdateInstructor}>保存更改</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                    <Dialog open={isDeleteDialogOpen && currentInstructor?.id === instructor.id} onOpenChange={(open) => !open && setCurrentInstructor(null)}>
                      <DialogTrigger asChild>
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => {
                            setCurrentInstructor(instructor);
                            setIsDeleteDialogOpen(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>删除讲师</DialogTitle>
                          <DialogDescription>
                            确定要删除讲师 {currentInstructor?.name} 吗？此操作无法撤销。
                          </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>取消</Button>
                          <Button variant="destructive" onClick={handleDeleteInstructor}>确认删除</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
};
