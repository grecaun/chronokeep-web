import { isRouteErrorResponse, useRouteError } from "react-router-dom";
import Header from "../Parts/Header";
import ErrorMsg from "../Parts/ErrorMsg";
import Footer from "../Parts/Footer";

function Error() {
    const err = useRouteError();
    if (isRouteErrorResponse(err)) {
        document.title = `Chronokeep - Error`
        let msg: string = err.statusText;
        if (err.data) {
            const data = err.data as { message?: string }
            if (data.message) {
                msg = data.message;
            }
        }
        return (
            <div>
                <Header page={"events"} />
                <ErrorMsg status={err.status} message={msg} />
                <Footer />
            </div>
        )
    }
}

export default Error;