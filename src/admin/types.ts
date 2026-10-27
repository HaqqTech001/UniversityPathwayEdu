export type AdminTabId =
  | 'dashboard'
  | 'students'
  | 'academic'
  | 'cbt'
  | 'resources'
  | 'finance'
  | 'notices'
  | 'messages'
  | 'notifications'
  | 'staff';

export interface AdminNavItem {
  id: AdminTabId;
  label: string;
  iconName: string;
}

export const ADMIN_NAV_ITEMS: AdminNavItem[] = [
  { id: 'dashboard', label: 'Dashboard', iconName: 'Home' },
  { id: 'students', label: 'Students', iconName: 'User' },
  { id: 'academic', label: 'Academic Management', iconName: 'Layers' },
  { id: 'cbt', label: 'CBT & Examinations', iconName: 'FileCheck' },
  { id: 'resources', label: 'Learning Resources', iconName: 'BookOpen' },
  { id: 'finance', label: 'Finance & Payments', iconName: 'CreditCard' },
  { id: 'notices', label: 'Notice Board', iconName: 'Megaphone' },
  { id: 'messages', label: 'Messages', iconName: 'MessageSquare' },
  { id: 'notifications', label: 'Notifications', iconName: 'Bell' },
  { id: 'staff', label: 'Staff & Roles', iconName: 'Users' },
];
