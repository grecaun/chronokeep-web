import { QRCode as QR } from 'react-qrcode-logo';
import Loading from '../Parts/Loading';
import ErrorMsg from '../Parts/ErrorMsg';
import { useParams } from 'react-router-dom';
import { PageProps } from '../Interfaces/props';
import { ResultsLoader } from '../loaders/results';

function QRCode(props: PageProps) {
    const params = useParams();
    const state = ResultsLoader(params, props.page);
    const href = window.location.href.slice(0, window.location.href.length - 3);
    document.title = `Chronokeep - QRCode`
    if (state.error === true) {
        document.title = `Chronokeep - Error`
        return (
            <ErrorMsg status={state.status} message={state.message} />
        );
    }
    if (state.loading) {
        return (
            <Loading message='Verifying event exists.' />
        );
    }
    const codeName = params.year !== undefined ? `${state.year!.year} ${state.event!.name}` : `${state.event!.name}`;
    document.title = `Chronokeep - ${codeName} QRCode`;
    return (
        <div className="qr-holder">
            <div className="qr-buffer" />
            <h1 className="qr-label display-4">{codeName}</h1>
            <h1 className="qr-label display-4">{state.page === "awards" ? "Awards" : state.page === "status" ? "Status" : "Results"} By</h1>
            <QR value={href} ecLevel='H' size={350} quietZone={10} bgColor='#FFFFFF' fgColor='#5c6c7d' qrStyle='dots' eyeRadius={20} />
            <h1 className="qr-label display-4">Chronokeep</h1>
        </div>
    )
}

export default QRCode;