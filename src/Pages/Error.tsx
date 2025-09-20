import { isRouteErrorResponse, useLocation, useRouteError } from "react-router-dom";
import ErrorMsg from "../Parts/ErrorMsg";
import Header from "../Parts/Header";
import Footer from "../Parts/Footer";

function Error() {
    const err = useRouteError();
    const location = useLocation();
    if (isRouteErrorResponse(err)) {
        document.title = `Chronokeep - Error`
        let msg: string = err.statusText;
        if (err.data) {
            const data = err.data as { message?: string }
            if (data.message) {
                msg = data.message;
            }
        }
        const pageName = location.pathname.split("/")[1];
        return (
            <div>
                <Header page={pageName} />
                <ErrorMsg status={err.status} message={msg} />
                <Footer />
            </div>
        )
    }
}

export default Error;