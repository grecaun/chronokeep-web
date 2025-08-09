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
import Certificate, { CertificateNoAPI } from './Pages/Certificate';
import Unsubscribe from './Pages/Unsubscribe';
import Subscribe from './Pages/Subscribe';
import Checkin from './Pages/Checkin';
import PNTF from './Pages/PNTF';
import YTP from './Pages/YTP';

const router = createBrowserRouter([
  {
    path: '/certificate/:slug/:year/:bib',
    element: <Certificate />
  },
  {
    path: '/certificate/:name/:event/:time/:date',
    element: <CertificateNoAPI />
  },
  {
    element: <DefaultPage />,
    errorElement: <Error />,
    children:
    [
      {
        path: '/unsubscribe/:email',
        element: <Unsubscribe />
      },
      {
        path: '/subscribe/:email',
        element: <Subscribe />
      },
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
        path: '/checkin/:slug/:year?',
        element: <Checkin />
      },
      {
        path: '/checkin/:slug/:year?/qr',
        element: <QRCode page='registration' />
      },
      {
        path: '/pntf/:slug/:year?',
        element: <PNTF page='rankings' />
      },
      {
        path: '/pntf/:slug/:year?/qr',
        element: <QRCode page='pntf' />
      },
      {
        path: '/pntf-awards/:slug/:year?',
        element: <PNTF page='pntf-awards' />
      },
      {
        path: '/pntf-awards/:slug/:year?/qr',
        element: <QRCode page='pntf-awards' />
      },
      {
        path: '/ytp-awards/:slug/:year?',
        element: <YTP page='championship'/>
      },
      {
        path: '/ytp-awards/:slug/:year?/qr',
        element: <QRCode page='ytp' />
      },
      {
        path: '/ytp-series/:slug/:year?',
        element: <YTP page='series'/>
      },
      {
        path: '/ytp-series/:slug/:year?/qr',
        element: <QRCode page='ytp-series' />
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
    <RouterProvider router={router} future={{ v7_startTransition: true, }}/>
  </React.StrictMode>,
)
