
import { useState, useEffect, useCallback } from 'react';

export const useVisibilityTracking = () => {
  const [visibleSections, setVisibleSections] = useState({
    intro: false,
    outline: false,
    attachments: false,
    learningInfo: false
  });

  const updateSectionVisibility = useCallback((sectionId, isVisible) => {
    setVisibleSections(prev => ({
      ...prev,
      [sectionId]: isVisible
    }));
  }, []);

  return { visibleSections, updateSectionVisibility };
};
