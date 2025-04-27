import FullLayout from '../layouts/FullLayout';
import RegisterPage from '../pages/Register';
import LoginPage from '../pages/Login';
import Dashboard from '../pages/Dashboard';
import Repository from '../pages/Repository';
import Model from '../pages/Model';
import User from '../pages/User';

// Public routes
const publicRoutes = [
  {
    path: '/login',
    component: LoginPage,
    layout: FullLayout,
  },
  {
    path: '/register',
    component: RegisterPage,
    layout: FullLayout,
  },
  {
    path: '/',
    component: Dashboard,
    props: {
      heading: 'Trang chủ',
    },
  },
  {
    path: '/repositories',
    component: Repository,
    props: {
      heading: 'Repositories',
    },
  },
  {
    path: '/models',
    component: Model,
    props: {
      heading: 'Models',
    },
  },
  {
    path: '/users',
    component: User,
    props: {
      heading: 'Sản phẩm',
    },
  },
  {
    path: '/settings',
    component: User,
    props: {
      heading: 'Sản phẩm',
    },
  },
];

const privateRoutes = [];

export { publicRoutes, privateRoutes };
