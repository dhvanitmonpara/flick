import { MdDashboard, MdFeedback, MdManageAccounts } from "react-icons/md";
import { IoSettings } from "react-icons/io5";
import { TbMessageReportFilled } from "react-icons/tb";
import { FaGraduationCap, FaTable } from "react-icons/fa6";
import { FaBan } from "react-icons/fa";

export const tabs = [
  {
    name: 'Dashboard',
    path: '/',
    icon: <MdDashboard />
  },
  {
    name: 'Users',
    path: '/users',
    icon: <MdManageAccounts />
  },
  {
    name: 'Reports',
    path: '/reports',
    icon: <TbMessageReportFilled />
  },
  {
    name: 'Colleges',
    path: '/colleges',
    icon: <FaGraduationCap />
  },
  {
    name: 'Branches',
    path: '/branches',
    icon: <FaGraduationCap />
  },
  {
    name: 'Banned Words',
    path: '/banned-words',
    icon: <FaBan />
  },
  {
    name: 'Logs',
    path: '/logs',
    icon: <FaTable />
  },
  {
    name: 'Feedbacks',
    path: '/feedbacks',
    icon: <MdFeedback />
  },
  {
    name: 'Settings',
    path: '/settings',
    icon: <IoSettings />
  }
]