
// 导出主编辑器组件
export { CourseOutlineEditor } from './CourseOutlineEditor';

// 导出Hook
export { useCourseOutlineManager } from './hooks/useCourseOutlineManager';

// 导出章节相关组件
export { SectionList } from './sections/SectionList';
export { SectionItem } from './sections/SectionItem';
export { AddSectionForm } from './sections/AddSectionForm';

// 导出课时相关组件
export { LectureItem } from './lectures/LectureItem';
export { AddLectureForm } from './lectures/AddLectureForm';
export { SectionLectureList } from './lectures/SectionLectureList';
export { LectureHomeworkSettings } from './lectures/LectureHomeworkSettings';
import VideoPanel from './lectures/VideoPanel';
export { VideoPanel };

// 导出共享组件
export { ConfirmDialog } from '../../shared/ConfirmDialog';
