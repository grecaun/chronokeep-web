import './style.css'

import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider, } from "react-router-dom";
import { PrivateRoute } from './Auth/PrivateRoute';
import QRCode from './Pages/QRCode';
import Awards, { awardsLoader } from './Pages/Awards';
import Status from './Pages/Status';
import Person from './Pages/Person';
import Results from './Pages/Results';
import Login from './Pages/Login';
import Logout, { logoutLoader } from './Pages/Logout';
import Account from './Pages/Account';
import Events from './Pages/Events';
import Error from './Pages/Error';

const router = createBrowserRouter([
  {
    path: '/awards/:slug/:year?',
    element: <Awards />,
    loader: ({ params }) => awardsLoader(params)
  },
  {
    path: '/results/:slug/:year?/status?/qr',
    element: <QRCode />
  },
  {
    path: '/results/:slug/:year?/status',
    element: <Status />
  },
  {
    path: '/results/:slug/:year/:bib',
    element: <Person />
  },
  {
    path: '/results/:slug/:year?',
    element: <Results />
  },
  {
    path: '/remote/login',
    element: <Login page='remote' />
  },
  {
    path: '/remote/logout',
    element: <Logout />,
    loader: () => logoutLoader('remote')
  },
  {
    path: '/remote',
    element: <PrivateRoute page='remote' />,
    children:
    [
      {
        path: "",
        element: <Account page='remote' />
      },
    ]
  },
  {
    path: '/login',
    element: <Login page='account' />
  },
  {
    path: '/logout',
    element: <Logout />,
    loader: () => logoutLoader('account')
  },
  {
    path: '/account',
    element: <PrivateRoute page='account' />,
    children:
    [
      {
        path: "",
        element: <Account page='account' />
      },
    ]
  },
  {
    path: '/',
    element: <Events />, errorElement: <Error />
  },
])

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
)
