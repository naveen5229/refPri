import { NbMenuItem } from '@nebular/theme';

export const MENU_ITEMS: NbMenuItem[] = [
  {
    title: 'Dashboard',
    icon: 'shopping-cart-outline',
    link: '/pages/dashboard',
    home: true,
  },
  {
    title:'User',
    icon: 'fas fa-users',
    link: '/pages/user',
    home: true,
  },
  {
    title:'Project',
    icon: 'fas fa-project-diagram',
    link: '/pages/project',
    home: true,
  },
  {
    title:'Module',
    icon: 'fas fa-file-invoice',
    link: '/pages/modules',
    home: true,
  },
  {
    title:'Task Assign',  
    icon: 'fas fa-sun',
    link: '/pages/task-assign',
    home: true,
  },
  {
    title:'Work Logs',  
    icon: 'fas fa-sun',
    link: '/pages/work-logs',
    home: true,
  }
];
