import { Outlet, useLocation } from "react-router-dom";
import Header from "../Parts/Header";
import Footer from "../Parts/Footer";
import { LiveProvider } from "../Parts/LiveStatus";

function DefaultPage() {
    const location = useLocation();
    const pageName = location.pathname.split("/")[1];
    return (
        <LiveProvider>
            <div>
                <Header page={pageName} />
                <Outlet />
                <Footer />
            </div>
        </LiveProvider>
    )
}

export default DefaultPage