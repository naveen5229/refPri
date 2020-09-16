import { NbMenuItem } from '@nebular/theme';

export const MENU_ITEMS = JSON.stringify([
  {
    title: "Admin",
    icon: 'people-outline',
    home: true,
    children: [
      {
        title: 'User Role',
        icon: 'people-outline',
        link: '/pages/user-role',
        home: true,
      },
      {
        title: 'Add Pages',
        icon: 'people-outline',
        link: '/pages/add-pages',
        home: true,
      },
      {
        title: 'Admin-Tool',
        icon: 'people-outline',
        link: '/pages/admin-tool',
        home: true,
      },
      {
        title: 'User Groups',
        icon: 'grid-outline',
        link: '/pages/user-groups',
        home: true,
      },
      {
        title: 'Ticket-Call-Mapping',
        icon: 'file-text-outline',
        link: '/pages/ticket-call-mapping',
        home: true,
      },
      {
        title: 'Daily-Report',
        icon: 'list-outline',
        link: '/pages/daily-report',
        home: true,
      },
      {
        title: 'Miscellaneous-Report',
        icon: 'list-outline',
        link: '/pages/daily-partner-report',
        home: true,
      },
      {
        title: 'WW-Tools',
        icon: 'file-text-outline',
        link: '/pages/ww-tools',
        home: true,
      },
      {
        title: 'Task',
        icon: 'file-text-outline',
        link: '/pages/task',
        home: true,
      },
      {
        title: 'User-Mapping',
        icon: 'file-text-outline',
        link: '/pages/user-mapping',
        home: true,
      },
      {
        title: 'Company KYC',
        icon: 'file-text-outline',
        link: '/pages/companykyc',
        home: true,
      },
      {
        title: 'Task-Admin',
        icon: 'file-text-outline',
        link: '/pages/task-scheduled',
        home: true,
      },
      {
        title: 'Customer-Feedback',
        icon: 'file-text-outline',
        link: '/pages/future-ref',
        home: true,
      },
      {
        title: 'Call-KPI',
        icon: 'file-text-outline',
        link: '/pages/call-kpi',
        home: true,
      },
      {
        title: 'Attendance',
        icon: 'file-text-outline',
        link: '/pages/attendance',
        home: true,
      },
      {
        title: 'Shift-Logs',
        icon: 'file-text-outline',
        link: '/pages/shift-logs',
        home: true,
      },
      {
        title: 'WIFI-Logs',
        icon: 'file-text-outline',
        link: '/pages/wifi-logs',
        home: true,
      },
      {
        title: 'OT-Management',
        icon: 'file-text-outline',
        link: '/pages/ot-management',
        home: true,
      },
      {
        title: 'Activity-Logs',
        icon: 'file-text-outline',
        link: '/pages/activity-logs',
        home: true,
      },
      {
        title: 'Activity-Logs-Summary',
        icon: 'file-text-outline',
        link: '/pages/activity-logs-summary',
        home: true,
      },
      {
        title: 'Holiday-Calendar',
        icon: 'calendar',
        link: '/pages/holiday-calendar',
        home: true,
      },
      {
        title: 'Travel Distance',
        icon: 'map-outline',
        link: '/pages/travel-distance',
        home: true,
      },
      {
        title: 'salary',
        icon: 'file-text-outline',
        link: '/pages/salary',
        home: true,
      }
    ]
  },
  {
    title: "IT",
    icon: 'monitor-outline',
    home: true,
    children: [
      {
        title: 'Dashboard',
        icon: 'shopping-cart-outline',
        link: '/pages/dashboard',
        home: true,
      },
      {
        title: 'User',
        icon: 'people-outline',
        link: '/pages/user',
        home: true,
      },
      {
        title: 'Project',
        icon: 'file-text-outline',
        link: '/pages/project',
        home: true,
      },
      {
        title: 'Module',
        icon: 'cube-outline',
        link: '/pages/modules',
        home: true,
      },
      {
        title: 'Segment',
        icon: 'cube-outline',
        link: '/pages/segment',
        home: true,
      },
      {
        title: 'Tasks',
        icon: 'list-outline',
        link: '/pages/task-assign',
        home: true,
      },
      {
        title: 'Work Logs',
        icon: 'list-outline',
        link: '/pages/work-logs',
        home: true,
      },
      {
        title: 'Add Stack',
        icon: 'cube-outline',
        link: '/pages/add-stacks',
        home: true,
      },
      {
        title: 'Distance Calculate',
        icon: 'cube-outline',
        link: '/pages/distance-calculate',
        home: true,
      },
      {
        title: 'Employee Period ',
        icon: 'file-text-outline',
        link: '/pages/employee-period-report',
        home: true,
      },

      {
        title: 'Employee Monthly ',
        icon: 'file-text-outline',
        link: '/pages/employee-monthly-report',
        home: true,
      },
      {
        title: 'Employee DayWise ',
        icon: 'file-text-outline',
        link: '/pages/employee-daywise-report',
        home: true,
      },
      {
        title: 'Module Report',
        icon: 'file-text-outline',
        link: '/pages/module-report',
        home: true
      },
      {
        title: 'Segment Report',
        icon: 'file-text-outline',
        link: '/pages/segment-report',
        home: true,
      },
      {
        title: 'Component Report',
        icon: 'file-text-outline',
        link: '/pages/component-report',
        home: true,
      },
      {
        title: 'Segment Stack Report',
        icon: 'file-text-outline',
        link: '/pages/segment-stack-report',
        home: true,
      }]
  },
  {
    title: "Campaign",
    icon: 'layers-outline',
    home: true,
    children: [
      {
        title: 'Add-Campaign',
        icon: 'plus-square-outline',
        link: '/pages/add-campaign',
        home: true,
      }, {
        title: 'Campaign Master',
        icon: 'grid-outline',
        link: '/pages/campaign-master-page',
        home: true,
      },
      {
        title: 'Campaign Dashboard',
        icon: 'award-outline',
        link: '/pages/campaign-target',
        home: true,
      },
      {
        title: 'My Dashboard',
        icon: 'award-outline',
        link: '/pages/my-campaign',
        home: true,
      },
      {
        title: 'Campaign Summary',
        icon: 'award-outline',
        link: '/pages/campaign-summary',
        home: true,
      }

    ]
  },
  {
    title: "Grid",
    icon: 'layers-outline',
    home: true,
    children: [
      {
        title: 'Field-Support-Request',
        icon: 'plus-square-outline',
        link: '/pages/field-support-request',
        home: true,
      }, {
        title: 'Installer',
        icon: 'grid-outline',
        link: '/pages/installer',
        home: true,
      },
    ]
  },
  {
    title: "Process",
    icon: 'layers-outline',
    home: true,
    children: [
      {
        title: 'Process List',
        icon: 'plus-square-outline',
        link: '/pages/process-list',
        home: true,
      },
      {
        title: 'My Process',
        icon: 'grid-outline',
        link: '/pages/my-process',
        home: true,
      },
      {
        title: 'Process Admin',
        icon: 'grid-outline',
        link: '/pages/process-admin',
        home: true,
      },
      {
        title: 'Custom Dashboard',
        icon: 'grid-outline',
        link: '/pages/personalised-dashboard',
        home: true,
      },
      {
        title: 'Graphical Reports',
        icon: 'grid-outline',
        link: '/pages/graphical-reports',
        home: true,
      }
    ]
  }

]);
