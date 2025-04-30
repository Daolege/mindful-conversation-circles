import { db } from "@/lib/db";
import { HomeworkSubmission } from "@prisma/client";

export const getHomeworkSubmissionById = async (id: string) => {
  try {
    const homeworkSubmission = await db.homeworkSubmission.findUnique({
      where: {
        id,
      },
    });

    return homeworkSubmission;
  } catch (error) {
    console.error("Error getting homework submission by id:", error);
    return null;
  }
};

export const getHomeworkSubmissionsByCourseId = async (courseId: string) => {
  try {
    const homeworkSubmissions = await db.homeworkSubmission.findMany({
      where: {
        courseId,
      },
    });

    return homeworkSubmissions;
  } catch (error) {
    console.error("Error getting homework submissions by course id:", error);
    return null;
  }
};

export const getHomeworkSubmissionsByUserId = async (userId: string) => {
  try {
    const homeworkSubmissions = await db.homeworkSubmission.findMany({
      where: {
        userId,
      },
    });

    return homeworkSubmissions;
  } catch (error) {
    console.error("Error getting homework submissions by user id:", error);
    return null;
  }
};

export const getHomeworkSubmissionsByHomeworkId = async (homeworkId: string) => {
  try {
    const homeworkSubmissions = await db.homeworkSubmission.findMany({
      where: {
        homeworkId,
      },
    });

    return homeworkSubmissions;
  } catch (error) {
    console.error("Error getting homework submissions by homework id:", error);
    return null;
  }
};

export const createHomeworkSubmission = async (
  homeworkSubmission: Omit<HomeworkSubmission, "id" | "createdAt" | "updatedAt">
) => {
  try {
    const newHomeworkSubmission = await db.homeworkSubmission.create({
      data: homeworkSubmission,
    });

    return newHomeworkSubmission;
  } catch (error) {
    console.error("Error creating homework submission:", error);
    return null;
  }
};

export const updateHomeworkSubmissionById = async (id: string, data: any) => {
  const validData = { ...data };
  if (validData.score !== undefined) {
    delete validData.score;
  }

  try {
    const updatedHomeworkSubmission = await db.homeworkSubmission.update({
      where: {
        id,
      },
      data: validData,
    });

    return updatedHomeworkSubmission;
  } catch (error) {
    console.error("Error updating homework submission by id:", error);
    return null;
  }
};

export const deleteHomeworkSubmissionById = async (id: string) => {
  try {
    await db.homeworkSubmission.delete({
      where: {
        id,
      },
    });

    return true;
  } catch (error) {
    console.error("Error deleting homework submission by id:", error);
    return false;
  }
};
