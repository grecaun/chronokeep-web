import { Outlet, useLocation } from "react-router-dom";
import Header from "../Parts/Header";
import Footer from "../Parts/Footer";

function DefaultPage() {
    const location = useLocation();
    const pageName = location.pathname.split("/")[1];
    console.log(pageName);
    return (
        <div>
            <Header page={pageName} />
            <Outlet />
            <Footer />
        </div>
    )
}

export default DefaultPage