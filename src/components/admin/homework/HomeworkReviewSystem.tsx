
// This is a transition file to help with migration from HomeworkReviewSystem to HomeworkSubmissionsView
// Please use HomeworkSubmissionsView for new code

import { HomeworkSubmissionsView } from './HomeworkSubmissionsView';

// Re-export HomeworkSubmissionsView as HomeworkReviewSystem for backward compatibility
export { HomeworkSubmissionsView as HomeworkReviewSystem };
export default HomeworkSubmissionsView;
