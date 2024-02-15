import { isRouteErrorResponse, useRouteError } from "react-router-dom";
import ErrorMsg from "../Parts/ErrorMsg";

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
            <ErrorMsg status={err.status} message={msg} />
        )
    }
}

export default Error;