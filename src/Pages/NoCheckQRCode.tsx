import { QRCode as QR } from 'react-qrcode-logo';

function NoCheckQRCode() {
    const href = window.location.href.slice(0, window.location.href.length - 3);
    document.title = `Chronokeep - QRCode`

    document.title = `Chronokeep - QRCode`;
    return (
        <div className="qr-holder">
            <div className="qr-buffer" />
            <QR value={href} ecLevel='H' size={350} quietZone={10} bgColor='#FFFFFF' fgColor='#5c6c7d' qrStyle='dots' eyeRadius={20} />
        </div>
    )
}

export default NoCheckQRCode;