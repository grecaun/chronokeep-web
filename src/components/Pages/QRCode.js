import React, { Component } from 'react';
import { QRCode as QR } from 'react-qrcode-logo';
import Header from '../Parts/Header';
import Footer from '../Parts/Footer';

class QRCode extends Component {
    constructor(props) {
        super(props);
        const href = window.location.href.slice(0, window.location.href.length - 3)
        this.state = {
            value: href,
            ecLevel: 'H',
            size: 350,
            quietZone: 10, 
            bgColor: "#FFFFFF",
            fgColor: "#5c6c7d",
            qrStyle: "dots",
            eyeRadius: 20
        }
    }

    render() {
        const state = this.state;
        return (
            <div>
                { Header("qrcode") }
                <div className="qr-holder">
                    <div className="qr-buffer" />
                    <h1 className="qr-label display-4">Results By</h1>
                    <QR {...{
                        ...state
                    }} />
                    <h1 className="qr-label display-4">Chronokeep</h1>
                </div>
                { Footer() }
            </div>
        )
    }
}

export default QRCode;