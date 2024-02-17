function Loading(props: { message?: string }) {
    let msg = 'Loading';
    if (props.message !== undefined) {
        msg = props.message
    }
    return (
        <div className="mx-auto sm-max-width text-center container-md border border-light p-5 pt-4">
            <h1 className="text-important display-4">{msg}</h1>
            <div className="d-flex justify-content-center align-items-center">
                <div className="spinner-border text-primary ck-spinner m-5" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        </div>
    );
}

export default Loading;