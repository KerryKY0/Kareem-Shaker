import React from 'react';

// Configuration
export const APP_NAME = "المذاكرة";
export const MIN_PASS_LENGTH_OPTIONS = [4, 6, 8];

// Initial Mock Data
export const INITIAL_SECTIONS = [
  { id: 'sec1', title: 'المرحلة الثانوية' },
  { id: 'sec2', title: 'المرحلة الجامعية' },
];

export const INITIAL_SUBJECTS = [
  { id: 'sub1', title: 'الرياضيات المتقدمة', sectionId: 'sec1' },
  { id: 'sub2', title: 'الفيزياء النووية', sectionId: 'sec1' },
  { id: 'sub3', title: 'علوم الحاسب', sectionId: 'sec2' },
];
