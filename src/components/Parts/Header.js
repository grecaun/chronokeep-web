import logo from '../../logo.png';
import React from 'react';
import { Link } from 'react-router-dom';

import { authenticationService } from '../Auth/_services/authentication.service';

const Header = (page) => {
  var accountLink = <Link to={'/login'} className={page === "login" ? "nav-link active" : "nav-link"}>Login</Link>
  if (authenticationService.currentUserValue) {
    accountLink = <Link to={'/logout'} className="nav-link">Logout</Link>
  }
  return (
    <nav className="navbar navbar-expand-sm navbar-light shadow-sm">
      <div className="container-lg lg-max-width">
        <Link className="navbar-brand align-items-center" to={'/'}><img src={logo} className="logo" alt="logo"/></Link>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarSupportedContent">
          <div className="navbar-nav">
            <Link to={'/'} className={page === "event" ? "nav-link active" : "nav-link"}>Events</Link>
          </div>
          <div>
            {accountLink}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Header