
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { 
  Dialog, 
  DialogContent, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger,
  DialogDescription
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Loader2, Plus, Pencil, Trash2 } from "lucide-react";
import { ContactMethod, handleContactMethodsQueryError } from "@/lib/supabaseUtils";

export function ContactMethodsSettings() {
  const queryClient = useQueryClient();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentMethod, setCurrentMethod] = useState<ContactMethod | null>(null);
  const [newMethod, setNewMethod] = useState({
    type: "",
    value: "",
    label: "",
    display_order: 0
  });

  const { data: contactMethods = [], isLoading } = useQuery({
    queryKey: ["admin-contact-methods"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("contact_methods")
        .select("*")
        .order("display_order");
      
      return handleContactMethodsQueryError(data, error);
    },
  });

  const addContactMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("contact_methods")
        .insert([newMethod as any]);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-contact-methods"] });
      setIsAddDialogOpen(false);
      setNewMethod({ 
        type: "",
        value: "",
        label: "",
        display_order: contactMethods.length + 1
      });
      toast.success("联系方式已添加");
    },
    onError: (error) => {
      console.error("Error adding contact method:", error);
      toast.error("添加联系方式失败");
    },
  });

  const updateContactMutation = useMutation({
    mutationFn: async () => {
      if (!currentMethod) return;
      
      const { error } = await supabase
        .from("contact_methods")
        .update({
          value: currentMethod.value,
          label: currentMethod.label,
          is_active: currentMethod.is_active,
          display_order: currentMethod.display_order
        } as any)
        .eq("id", currentMethod.id as any);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-contact-methods"] });
      setCurrentMethod(null);
      toast.success("联系方式已更新");
    },
    onError: (error) => {
      console.error("Error updating contact method:", error);
      toast.error("更新联系方式失败");
    },
  });

  const deleteContactMutation = useMutation({
    mutationFn: async () => {
      if (!currentMethod) return;
      
      const { error } = await supabase
        .from("contact_methods")
        .delete()
        .eq("id", currentMethod.id as any);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-contact-methods"] });
      setCurrentMethod(null);
      setIsDeleteDialogOpen(false);
      toast.success("联系方式已删除");
    },
    onError: (error) => {
      console.error("Error deleting contact method:", error);
      toast.error("删除联系方式失败");
    },
  });

  const toggleActiveState = async (method: ContactMethod) => {
    try {
      const { error } = await supabase
        .from("contact_methods")
        .update({
          is_active: !method.is_active
        } as any)
        .eq("id", method.id as any);

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ["admin-contact-methods"] });
      toast.success(`联系方式已${method.is_active ? '停用' : '启用'}`);
    } catch (error: any) {
      console.error("Error toggling contact method state:", error);
      toast.error("更新失败: " + error.message);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">联系方式管理</h3>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              添加联系方式
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>添加新联系方式</DialogTitle>
              <DialogDescription>
                添加一个新的联系方式，将在网站底部显示。
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="type" className="text-right">
                  类型
                </Label>
                <Input
                  id="type"
                  value={newMethod.type}
                  onChange={(e) => setNewMethod({ ...newMethod, type: e.target.value })}
                  className="col-span-3"
                  placeholder="email, phone, address, etc."
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="value" className="text-right">
                  值
                </Label>
                <Input
                  id="value"
                  value={newMethod.value}
                  onChange={(e) => setNewMethod({ ...newMethod, value: e.target.value })}
                  className="col-span-3"
                  placeholder="联系信息值"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="label" className="text-right">
                  标签
                </Label>
                <Input
                  id="label"
                  value={newMethod.label}
                  onChange={(e) => setNewMethod({ ...newMethod, label: e.target.value })}
                  className="col-span-3"
                  placeholder="显示名称（可选）"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="order" className="text-right">
                  显示顺序
                </Label>
                <Input
                  id="order"
                  type="number"
                  value={newMethod.display_order}
                  onChange={(e) => setNewMethod({ ...newMethod, display_order: parseInt(e.target.value) || 0 })}
                  className="col-span-3"
                />
              </div>
            </div>
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setIsAddDialogOpen(false)}
              >
                取消
              </Button>
              <Button onClick={() => addContactMutation.mutate()}>
                保存
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-4">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : (
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>类型</TableHead>
                <TableHead>值</TableHead>
                <TableHead>标签</TableHead>
                <TableHead>显示顺序</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {contactMethods.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    没有联系方式数据
                  </TableCell>
                </TableRow>
              ) : (
                contactMethods.map((contact) => (
                  <TableRow key={contact.id}>
                    <TableCell>{contact.type}</TableCell>
                    <TableCell>{contact.value}</TableCell>
                    <TableCell>{contact.label || "-"}</TableCell>
                    <TableCell>{contact.display_order}</TableCell>
                    <TableCell>
                      <Switch 
                        checked={contact.is_active === true} 
                        onCheckedChange={() => toggleActiveState(contact)}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => setCurrentMethod(contact)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>编辑联系方式</DialogTitle>
                              <DialogDescription>
                                修改联系方式信息。
                              </DialogDescription>
                            </DialogHeader>
                            {currentMethod && (
                              <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-4 items-center gap-4">
                                  <Label className="text-right">类型</Label>
                                  <div className="col-span-3">
                                    <p className="text-sm font-medium">{currentMethod.type}</p>
                                    <p className="text-xs text-muted-foreground">类型不可修改</p>
                                  </div>
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                  <Label htmlFor="edit-value" className="text-right">
                                    值
                                  </Label>
                                  <Input
                                    id="edit-value"
                                    value={currentMethod.value}
                                    onChange={(e) => setCurrentMethod({ ...currentMethod, value: e.target.value })}
                                    className="col-span-3"
                                  />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                  <Label htmlFor="edit-label" className="text-right">
                                    标签
                                  </Label>
                                  <Input
                                    id="edit-label"
                                    value={currentMethod.label || ""}
                                    onChange={(e) => setCurrentMethod({ ...currentMethod, label: e.target.value })}
                                    className="col-span-3"
                                  />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                  <Label htmlFor="edit-order" className="text-right">
                                    显示顺序
                                  </Label>
                                  <Input
                                    id="edit-order"
                                    type="number"
                                    value={currentMethod.display_order}
                                    onChange={(e) => setCurrentMethod({ ...currentMethod, display_order: parseInt(e.target.value) || 0 })}
                                    className="col-span-3"
                                  />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                  <Label htmlFor="edit-active" className="text-right">
                                    启用
                                  </Label>
                                  <div className="col-span-3">
                                    <Switch 
                                      id="edit-active"
                                      checked={currentMethod.is_active === true}
                                      onCheckedChange={(checked) => setCurrentMethod({ ...currentMethod, is_active: checked })}
                                    />
                                  </div>
                                </div>
                              </div>
                            )}
                            <DialogFooter>
                              <Button 
                                variant="outline" 
                                onClick={() => setCurrentMethod(null)}
                              >
                                取消
                              </Button>
                              <Button onClick={() => updateContactMutation.mutate()}>
                                保存更改
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                        
                        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                          <DialogTrigger asChild>
                            <Button 
                              variant="destructive" 
                              size="sm"
                              onClick={() => {
                                setCurrentMethod(contact);
                                setIsDeleteDialogOpen(true);
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>删除联系方式</DialogTitle>
                              <DialogDescription>
                                确定要删除此联系方式吗？此操作无法撤销。
                              </DialogDescription>
                            </DialogHeader>
                            <DialogFooter>
                              <Button 
                                variant="outline" 
                                onClick={() => {
                                  setIsDeleteDialogOpen(false);
                                  setCurrentMethod(null);
                                }}
                              >
                                取消
                              </Button>
                              <Button 
                                variant="destructive"
                                onClick={() => deleteContactMutation.mutate()}
                              >
                                确认删除
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

export default ContactMethodsSettings;
