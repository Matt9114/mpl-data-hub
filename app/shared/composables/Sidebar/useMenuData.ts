// composables/Sidebar/useMenuData.ts
import {
  CubeTransparentIcon,
  ChartBarIcon,
  HomeIcon,
  CogIcon,
  Squares2X2Icon,
  DocumentChartBarIcon,
  ServerStackIcon,
  LifebuoyIcon,
  UserGroupIcon
} from '@heroicons/vue/24/outline'

export interface MenuItemRoute {
  to: string;
  label: string;
}

export interface MenuItem {
  key: string
  label: string
  to?: string
  routes?: MenuItemRoute[]
  roles: string[]
}

export interface MenuGroup {
  name: string
  icon: string
  items: MenuItem[]
}

export const iconMap: Record<string, any> = {
  home: HomeIcon,
  'chart-line': ChartBarIcon,
  'screwdriver-wrench': CogIcon,
  'tachometer-alt': Squares2X2Icon,
  'clipboard-list': DocumentChartBarIcon,
  database: ServerStackIcon,
  'life-ring': LifebuoyIcon,
  'user-cog': UserGroupIcon
}

export function getIcon(name: string) {
  return iconMap[name] || CubeTransparentIcon
}

// Zoznam skupín a položiek menu
export const menuItems: MenuGroup[] = [
  {
    name: 'Home',
    icon: 'home',
    items: [
      {
        key: 'mainMenu',
        label: 'Main menu',
        to: '/main',
        roles: ['admin', 'manager', 'guest']
      }
    ]
  },
  {
    name: 'Analytics',
    icon: 'chart-line',
    items: [
      {
        key: 'productionAnalytics',
        label: 'Production',
        roles: ['admin', 'manager'],
        routes: [
          { to: '/analytics/production/daily-metrics', label: 'Daily Metrics' },
          { to: '/analytics/production/monthly-metrics', label: 'Monthly Metrics' },
          { to: '/analytics/production/trends', label: 'Trends' }
        ]
      },
      {
        key: 'storageAnalytics',
        label: 'Storage',
        roles: ['admin', 'manager'],
        routes: [
          { to: '/analytics/storage/apr', label: 'APR' },
          { to: '/analytics/storage/block', label: 'Block storage' },
          { to: '/analytics/storage/high-runner', label: 'High runner' },
          { to: '/analytics/storage/low-runner', label: 'Low runner' },
          { to: '/analytics/storage/vna', label: 'VNA' },
          { to: '/analytics/storage/storage-overview', label: 'Overview' },
        ]
      },
      {
        key: 'operationsAnalytics',
        label: 'Operations',
        roles: ['admin', 'manager'],
        routes: [
          { to: '/analytics/operations/kitting', label: 'Kitting' },
          { to: '/analytics/operations/receiving', label: 'Receiving' },
          { to: '/analytics/operations/replenishment', label: 'Replenishment' },
          { to: '/analytics/operations/operations-overview', label: 'Overview' }
        ]
      }
    ]
  },
  {
    name: 'Tools',
    icon: 'screwdriver-wrench',
    items: [
      {
        key: 'indexrouter',
        label: 'Index router',
        to: '/tools/index-router',
        roles: ['admin', 'manager']
      },
      {
        key: 'sanityCheck',
        label: 'Sanity Check',
        to: '/tools/sanity-check',
        roles: ['admin', 'manager']
      },
      {
        key: 'dataFlowService',
        label: 'Data flow service',
        roles: ['admin', 'manager'],
        routes: [
            { to: '/tools/data-flow-service/ewm', label: 'EWM' },
            { to: '/tools/data-flow-service/apo', label: 'APO' },
            { to: '/tools/data-flow-service/ecc', label: 'ECC' },
            { to: '/tools/data-flow-service/mes', label: 'MES' },
        ]
      }
    ]
  },
  {
    name: 'Reports',
    icon: 'clipboard-list',
    items: [
      {
        key: 'warehouseReports',
        label: 'Warehouse Reports',
        roles: ['admin', 'manager'],
        routes: [
          { to: '/reports/warehouse/merging-1350', label: 'Merging 1350' },
          { to: '/reports/warehouse/merging-1340', label: 'Merging 1340' },
          { to: '/reports/warehouse/overstock-priority-biw', label: 'Overstock BiW' },
          { to: '/reports/warehouse/overstock-priority-tnf', label: 'Overstock TnF' },
          { to: '/reports/warehouse/wrong-allocation', label: 'Wrong allocation' }
        ]
      },
      {
        key: 'productionReports',
        label: 'Production Reports',
        roles: ['admin', 'manager'],
        routes: [
          { to: '/reports/production/model-mix', label: 'TLS model mix' }
        ]
      }
    ]
  },
  {
    name: 'Database',
    icon: 'database',
    items: [
      {
        key: 'dbExplorer',
        label: 'Explorer',
        roles: ['admin'],
        routes: [
          { to: '/database/explorer/tables', label: 'Tables' },
          { to: '/database/explorer/views', label: 'Views' },
          { to: '/database/explorer/functions', label: 'Functions' }
        ]
      },
      {
        key: 'dbBackup',
        label: 'Backup & Restore',
        roles: ['admin'],
        routes: [
          { to: '/database/backup_restore/backup-list', label: 'Backup List' },
          { to: '/database/backup_restore/create-backup', label: 'Create Backup' },
          { to: '/database/backup_restore/restore-backup', label: 'Restore Backup' }
        ]
      }
    ]
  },
  {
    name: 'Admin',
    icon: 'user-cog',
    items: [
      {
        key: 'userManagement',
        label: 'User Management',
        roles: ['admin'],
        routes: [
          { to: '/admin/user_managment/user-list', label: 'User List' },
          { to: '/admin/user_managment/roles-permissions', label: 'Roles & Permissions' },
          { to: '/admin/user_managment/activity-log', label: 'Activity Logs' }
        ]
      },
      {
        key: 'systemSettings',
        label: 'System Settings',
        to: '/admin/system-settings',
        roles: ['admin']
      }
    ]
  },
  {
    name: 'Support',
    icon: 'life-ring',
    items: [
      {
        key: 'faq',
        label: 'FAQ',
        to: '/support/faq',
        roles: ['admin', 'manager', 'guest']
      },
      {
        key: 'contact-support',
        label: 'Contact Support',
        to: '/support/contact-support',
        roles: ['admin', 'manager', 'guest']
      },
      {
        key: 'road-map',
        label: 'Road map',
        to: '/support/road-map',
        roles: ['admin', 'manager', 'guest']
      }
    ]
  }
];