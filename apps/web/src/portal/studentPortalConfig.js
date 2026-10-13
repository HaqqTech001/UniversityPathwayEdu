export const studentNavigation = [
  {id:'overview',label:'Overview',icon:'layout-dashboard'},
  {id:'practice',label:'UTME Practice',icon:'book-open-check'},
  {id:'assignments',label:'Assigned Exercises',icon:'clipboard-list'},
  {id:'progress',label:'My Progress',icon:'chart-no-axes-column'},
  {id:'notices',label:'Notice Board',icon:'megaphone'},
  {id:'profile',label:'My Profile',icon:'user-round'},
];
export const practiceModes = [
  {id:'practice',title:'Topic Practice',description:'Revise a subject or topic at your own pace.'},
  {id:'timed_mock',title:'Timed UTME Mock',description:'Practise under a countdown and review your performance.'},
  {id:'assignment',title:'Teacher Assignment',description:'Complete exercises assigned to your class.'},
];
export const studentDashboardEmptyState = {
  practiceAttempts:0,
  completedAssignments:0,
  notices:[],
  recentScores:[],
};
