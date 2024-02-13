import './style.css'

import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider, } from "react-router-dom";

import { PrivateRemoteRoute, PrivateRoute } from './Auth/PrivateRoute';
import QRCode from './Pages/QRCode';
import Awards from './Pages/Awards';
import Status from './Pages/Status';
import Person from './Pages/Person';
import Results from './Pages/Results';
import Login from './Pages/Login';
import Logout from './Pages/Logout';
import Account from './Pages/Account';
import Events from './Pages/Events';

const router = createBrowserRouter([
  { path: '/awards/:slug/:year/qr', element: <QRCode /> },
  { path: '/awards/:slug/qr', element: <QRCode /> },
  { path: '/awards/:slug/:year', element: <Awards /> },
  { path: '/awards/:slug', element: <Awards /> },
  { path: '/results/:slug/:year/qr', element: <QRCode /> },
  { path: '/results/:slug/:year/status/qr', element: <QRCode /> },
  { path: '/results/:slug/:year/status', element: <Status /> },
  { path: '/results/:slug/:year/:bib', element: <Person /> },
  { path: '/results/:slug/qr', element: <QRCode /> },
  { path: '/results/:slug/status', element: <Status /> },
  { path: '/results/:slug/:year', element: <Results /> },
  { path: '/results/:slug', element: <Results /> },
  { path: '/remote/login', element: <Login page='remote' /> },
  { path: '/remote/logout', element: <Logout page='remote' /> },
  { path: '/remote', element: <PrivateRemoteRoute />, children: [{ path: "", element: <Account page='remote' /> }] },
  { path: '/login', element: <Login page='account' /> },
  { path: '/logout', element: <Logout page='account' /> },
  { path: '/account', element: <PrivateRoute />, children: [{ path: "", element: <Account page='account' /> }] },
  { path: '/', element: <Events /> },
])

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
)
