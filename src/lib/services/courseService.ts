
// Add this export for the updateCourseOrder function
export const updateCourseOrder = async (courseIds: number[]) => {
  try {
    console.log('[courseService] Updating course display order:', courseIds);
    
    // Update each course with its new position
    const updatePromises = courseIds.map((courseId, index) => {
      return supabase
        .from('courses_new')  // Use courses_new table instead of courses
        .update({ display_order: index })
        .eq('id', courseId);
    });
    
    // Wait for all updates to complete
    await Promise.all(updatePromises);
    
    return { success: true };
  } catch (error) {
    console.error('[courseService] Error updating course order:', error);
    return { success: false, error };
  }
};
