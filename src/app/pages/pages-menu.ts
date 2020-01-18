import { NbMenuItem } from '@nebular/theme';

export const MENU_ITEMS: NbMenuItem[] = [
  {
    title: "Admin",
    icon: 'people-outline',
    link: '/pages/admin-tool',
    home: true,
    children: [
      {
        title: 'Admin-Tool',
        icon: 'people-outline',
        link: '/pages/admin-tool',
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
      }
    ]
  },
  {
    title: "IT",
    icon: 'monitor-outline',
    link: '/pages/dashboard',
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

    ]
  }

];
