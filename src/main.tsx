import './style.css'

import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider, } from "react-router-dom";
import { PrivateRoute } from './Auth/PrivateRoute';
import QRCode from './Pages/QRCode';
import Awards from './Pages/Awards';
import Status from './Pages/Status';
import Person from './Pages/Person';
import Results from './Pages/Results';
import Login from './Pages/Login';
import Logout from './Pages/Logout';
import Account from './Pages/Account';
import Events from './Pages/Events';
import Error from './Pages/Error';
import DefaultPage from './Pages/DefaultPage';
import Certificate from './Pages/Certificate';

const router = createBrowserRouter([
  {
    path: '/certificate/:slug/:year/:bib',
    element: <Certificate />
  },
  {
    element: <DefaultPage />,
    errorElement: <Error />,
    children:
    [
      {
        path: '/awards/:slug/:year?',
        element: <Awards />
      },
      {
        path: '/awards/:slug/:year?/qr',
        element: <QRCode page='awards' />
      },
      {
        path: '/results/:slug/:year?/status/qr',
        element: <QRCode page='status' />
      },
      {
        path: '/results/:slug/:year?/status',
        element: <Status />
      },
      {
        path: '/results/:slug/:year?/qr',
        element: <QRCode page='results' />
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
        element: <Logout page='remote' />
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
        path: '/account?/login',
        element: <Login page='account' />
      },
      {
        path: '/logout',
        element: <Logout page='account' />
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
        element: <Events />
      },
    ]
  },
])

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
)
