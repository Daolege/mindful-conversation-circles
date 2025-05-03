
import React from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Course } from "@/lib/types/course";
import { Link } from "react-router-dom";

interface SimpleCourseTabProps {
  courses?: Course[];
}

export function SimpleCourseTab({ courses }: SimpleCourseTabProps) {
  // Use default mock data if no courses provided
  const data = courses || [
    {
      id: 1,
      title: "高级前端开发",
      price: 299,
      status: "published" as const,
      currency: "cny",
      display_order: 1,
      is_featured: true,
      language: "zh", // Add language field
    },
    {
      id: 2,
      title: "React Native",
      price: 199,
      status: "draft" as const,
      currency: "cny",
      display_order: 2,
      is_featured: false,
      language: "zh", // Add language field
    },
    {
      id: 3,
      title: "Vue.js 3",
      price: 249,
      status: "archived" as const,
      currency: "cny",
      display_order: 3,
      is_featured: false,
      language: "zh", // Add language field
    },
  ];

  return (
    <div className="w-full">
      <Table>
        <TableCaption>最近的课程</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">课程ID</TableHead>
            <TableHead>课程名称</TableHead>
            <TableHead>价格</TableHead>
            <TableHead className="text-right">状态</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((course) => (
            <TableRow key={course.id}>
              <TableCell className="font-medium">{course.id}</TableCell>
              <TableCell>
                <Link to={`/admin/course-new/${course.id}`}>{course.title}</Link>
              </TableCell>
              <TableCell>{course.price}</TableCell>
              <TableCell className="text-right">{course.status}</TableCell>
            </TableRow>
          ))}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell colSpan={4}>
              <Button>
                <Link to="/admin?tab=courses-new">查看所有课程</Link>
              </Button>
            </TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    </div>
  );
}
