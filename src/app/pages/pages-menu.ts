import { NbMenuItem } from '@nebular/theme';

export const MENU_ITEMS = JSON.stringify([
  {
    title: "TMG Dashboard",
    icon: 'home-outline',
    link: '/pages/tmg-dashboard',
    home: true,
    // children: [
    //   {
    //     title: 'TMG Dashboard',
    //     icon: 'home-outline',
    //     link: '/pages/tmg-dashboard',
    //     home: true,
    //   }
    // ]
  },
 
  {
    title: "Admin",
    icon: 'people-outline',
    home: true,
    children: [
      // {
      //   title: 'TMG Dashboard',
      //   icon: 'home-outline',
      //   link: '/pages/tmg-dashboard',
      //   home: true,
      // },
      // {
      //   title: 'Continuity Report',
      //   //icon: 'fa-dashcube',
      //   link: '/pages/continuity-report',
      //   home: true,
      // },
      {
        title: 'Admin-Kanban',
        icon: 'file-text-outline',
        link: '/pages/admin-kanban',
        home: true,
      },
      // {
      //   title: 'Add Pages',
      //   icon: 'people-outline',
      //   link: '/pages/add-pages',
      //   home: true,
      // },
      {
        title: 'Admin-Tool',
        icon: 'people-outline',
        link: '/pages/admin-tool',
        home: true,
      },
      {
        title: 'Entity Details',
        icon: 'people-outline',
        link: '/pages/entity-details',
        home: true
      },
      // {
      //   title: 'User Expenses',
      //   icon: 'people-outline',
      //   link: '/pages/user-expenses',
      //   home: true,
      // }, {
      //   title: 'User Wise Expenses',
      //   icon: 'people-outline',
      //   link: '/pages/user-wise-expenses',
      //   home: true,
      // }, {
      //   title: 'On-Site-Images',
      //   icon: 'people-outline',
      //   link: '/pages/on-site-images',
      //   home: true,
      // }, {
      //   title: 'On Site Images Summary',
      //   icon: 'people-outline',
      //   link: '/pages/on-site-images-summary',
      //   home: true,
      // },
      {
        title: 'Task-Admin',
        icon: 'book-outline',
        link: '/pages/task-scheduled',
        home: true,
      },
      {
        title: 'User Groups',
        icon: 'people-outline',
        link: '/pages/user-groups',
        home: true,
      },
      {
        title: 'User Role',
        icon: 'people-outline',
        link: '/pages/user-role',
        home: true,
      },
      // {
      //   title: 'Ticket-Call-Mapping',
      //   icon: 'file-text-outline',
      //   link: '/pages/ticket-call-mapping',
      //   home: true,
      // },
      // {
      //   title: 'Daily-Report',
      //   icon: 'list-outline',
      //   link: '/pages/daily-report',
      //   home: true,
      // },
      // {
      //   title: 'Miscellaneous-Report',
      //   icon: 'list-outline',
      //   link: '/pages/daily-partner-report',
      //   home: true,
      // },
      // {
      //   title: 'WW-Tools',
      //   icon: 'file-text-outline',
      //   link: '/pages/ww-tools',
      //   home: true,
      // },
      // {
      //   title: 'Task',
      //   icon: 'file-text-outline',
      //   link: '/pages/task',
      //   home: true,
      // },
      // {
      //   title: 'Task Kanban',
      //   icon: 'grid-outline',
      //   link: '/pages/task-kanban',
      //   home: true,
      // },
      // {
      //   title: 'Task-Admin',
      //   icon: 'file-text-outline',
      //   link: '/pages/task-scheduled',
      //   home: true,
      // },
      // {
      //   title: 'Customer-On-Boarding',
      //   icon: 'file-text-outline',
      //   link: '/pages/customeronboarding',
      //   home: true,
      // },
      // {
      //   title: 'Company KYC',
      //   icon: 'file-text-outline',
      //   link: '/pages/companykyc',
      //   home: true,
      // },
      // {
      //   title: 'Customer-Feedback',
      //   icon: 'file-text-outline',
      //   link: '/pages/future-ref',
      //   home: true,
      // },
      // {
      //   title: 'Call-KPI',
      //   icon: 'file-text-outline',
      //   link: '/pages/call-kpi',
      //   home: true,
      // },
      // {
      //   title: 'Attendance',
      //   icon: 'file-text-outline',
      //   link: '/pages/attendance',
      //   home: true,
      // },
      // {
      //   title: 'Shift-Logs',
      //   icon: 'file-text-outline',
      //   link: '/pages/shift-logs',
      //   home: true,
      // },
      // {
      //   title: 'WIFI-Logs',
      //   icon: 'file-text-outline',
      //   link: '/pages/wifi-logs',
      //   home: true,
      // },
      // {
      //   title: 'Call-Logs',
      //   icon: 'file-text-outline',
      //   link: '/pages/call-logs',
      //   home: true,
      // },
      // {
      //   title: 'OT-Management',
      //   icon: 'file-text-outline',
      //   link: '/pages/ot-management',
      //   home: true,
      // },
      // {
      //   title: 'Activity-Logs',
      //   icon: 'file-text-outline',
      //   link: '/pages/activity-logs',
      //   home: true,
      // },
      // {
      //   title: 'Activity-Logs-Summary',
      //   icon: 'file-text-outline',
      //   link: '/pages/activity-logs-summary',
      //   home: true,
      // },
      // {
      //   title: 'Holiday-Calendar',
      //   icon: 'calendar',
      //   link: '/pages/holiday-calendar',
      //   home: true,
      // },
      // {
      //   title: 'Travel Distance',
      //   icon: 'map-outline',
      //   link: '/pages/travel-distance',
      //   home: true,
      // },
      // {
      //   title: 'salary',
      //   icon: 'file-text-outline',
      //   link: '/pages/salary',
      //   home: true,
      // },
      // {
      //   title: 'Employee Monitoring',
      //   icon: 'people-outline',
      //   link: '/pages/employee-monitoring',
      // },
      // {
      //   title: 'Sites',
      //   icon: 'people-outline',
      //   link: '/pages/site',
      // },
      {
        title: 'Settings',
        icon: 'settings-2-outline',
        link: '/pages/settings',
      },
    ]
  },
  {
    title: "User page",
    icon: 'person-outline',
    home: true,
    children: [
      {
        title: "Leave Management",
        icon: 'home-outline',
        link: '/pages/leave-management',
        home: true,
      },
      {
        title: 'Call-Logs',
        icon: 'phone-call-outline',
        link: '/pages/call-logs',
        home: true,
      },
      {
        title: 'Activity-Logs',
        icon: 'activity-outline',
        link: '/pages/activity-logs',
        home: true,
      },
      {
        title: 'Shift-Logs',
        icon: 'file-text-outline',
        link: '/pages/shift-logs',
        home: true,
      },
      {
        title: 'Meeting',
        icon: 'file-text-outline',
        link: '/pages/meeting',
        home: true,
      },
      {
        title: 'Meeting-Room',
        icon: 'file-text-outline',
        link: '/pages/meeting-room',
        home: true,
      }
    ]
  },
  {
    title: "Task",
    icon: 'briefcase-outline',
    home: true,
    children: [
      {
        title: 'Task',
        icon: 'book-outline',
        link: '/pages/task',
        home: true,
      },
      {
        title: 'Task Kanban',
        icon: 'book-open-outline',
        link: '/pages/task-kanban',
        home: true,
      }
    ]
  },
  {
    title: "Ticket",
    icon: 'layers-outline',
    home: true,
    children: [
      {
        title: 'Ticket-Call-Mapping',
        icon: 'file-text-outline',
        link: '/pages/ticket-call-mapping',
        home: true,
      },
      {
        title: 'Ticket Process',
        icon: 'grid-outline',
        link: '/pages/ticket-process',
        home: true,
      },
      {
        title: 'Ticket',
        icon: 'grid-outline',
        link: '/pages/ticket',
        home: true,
      },
      {
        title: 'Ticket-Admin',
        icon: 'person-done-outline',
        link: '/pages/ticket-admin',
        home: true,
      },
      {
        title: 'Custom-Dashboard',
        icon: 'grid-outline',
        link: '/pages/custom-dashboard',
        home: true,
      }
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
      },
      {
        title: 'Kanban Board',
        icon: 'grid-outline',
        link: '/pages/kanban-board',
        home: true,
      }
    ]
  },
  {
    title: "HR",
    icon: 'person-done-outline',
    home: true,
    children: [
      {
        title: 'Attendance',
        icon: 'person-done-outline',
        link: '/pages/attendance',
        home: true,
      },

      {
        title: 'Holiday-Calendar',
        icon: 'calendar',
        link: '/pages/holiday-calendar',
        home: true,
      },
      {
        title: 'OT-Management',
        icon: 'file-text-outline',
        link: '/pages/ot-management',
        home: true,
      },
      {
        title: 'salary',
        icon: 'file-text-outline',
        link: '/pages/salary',
        home: true,
      },
      {
        title: 'WIFI-Logs',
        icon: 'wifi-outline',
        link: '/pages/wifi-logs',
        home: true,
      },
      {
        title: 'Leave Type',
        icon: 'wifi-outline',
        link: '/pages/leave-type-management',
        home: true,
      },
    ]
  },
  {
    title: "Field Team",
    icon: 'navigation-2-outline',
    home: true,
    children: [
      {
        title: 'Employee Monitoring',
        icon: 'pin-outline',
        link: '/pages/employee-monitoring',
      },
      {
        title: 'On-Site-Images',
        icon: 'image-outline',
        link: '/pages/on-site-images',
        home: true,
      },
      {
        title: 'On Site Images Summary',
        icon: 'image-outline',
        link: '/pages/on-site-images-summary',
        home: true,
      },
      {
        title: 'Sites',
        icon: 'globe-2-outline',
        link: '/pages/site',
      },
      {
        title: 'Travel Distance',
        icon: 'map-outline',
        link: '/pages/travel-distance',
        home: true,
      },
      {
        title: 'User Expenses',
        icon: 'people-outline',
        link: '/pages/user-expenses',
        home: true,
      },
      {
        title: 'User Wise Expenses',
        icon: 'people-outline',
        link: '/pages/user-wise-expenses',
        home: true,
      },
    {
        title: 'Expenses Types',
        icon: 'people-outline',
        link: '/pages/Expense-type',
        home: true,
      },
       {
        title: 'Visit Management',
        icon: 'people-outline',
        link: '/pages/visit-management',
        home: true,
      },

    ]
  },
  {
    title: "Monitoring",
    icon: 'monitor-outline',
    home: true,
    children: [
      {
        title: 'Activity-Logs-Summary',
        icon: 'activity-outline',
        link: '/pages/activity-logs-summary',
        home: true,
      },
      {
        title: 'Call-KPI',
        icon: 'phone-outline',
        link: '/pages/call-kpi',
        home: true,
      },
      {
        title: 'Continuity Report',
        icon: 'file-text-outline',
        link: '/pages/continuity-report',
        home: true,
      },
    ]
  },
  {
    title: "Analytics",
    icon: 'pie-chart-outline',
    home: true,
    children: [
      {
        title: 'Graphical Reports',
        icon: 'grid-outline',
        link: '/pages/graphical-reports',
        home: true,
      },
    ]
  },
  {
    title: "IT - Admin",
    icon: 'file-text-outline',
    home: true,
    children: [
      {
        title: 'Add Pages',
        icon: 'plus-square-outline',
        link: '/pages/add-pages',
        home: true,
      },
      {
        title: 'Customer-On-Boarding',
        icon: 'file-text-outline',
        link: '/pages/customeronboarding',
        home: true,
      },
      {
        title: 'User-Mapping',
        icon: 'file-text-outline',
        link: '/pages/user-mapping',
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
    title: "To Remove",
    icon: 'scissors-outline',
    home: true,
    children: [
      {
        title: 'WW-Tools',
        icon: 'file-text-outline',
        link: '/pages/ww-tools',
        home: true,
      },
      {
        title: 'Company KYC',
        icon: 'file-text-outline',
        link: '/pages/companykyc',
        home: true,
      },
      {
        title: 'Customer-Feedback',
        icon: 'file-text-outline',
        link: '/pages/future-ref',
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
      }
    ]
  }

]);
