import React, { Component } from 'react';
import { QRCode as QR } from 'react-qrcode-logo';
import Header from '../Parts/Header';
import Footer from '../Parts/Footer';
import Loading from '../Parts/Loading';
import ErrorMsg from '../Parts/ErrorMsg';

class QRCode extends Component {
    constructor(props) {
        super(props);
        const href = window.location.href.slice(0, window.location.href.length - 3)
        this.state = {
            value: href,
            loading: true,
            error: false,
            slug: props.match.params.slug,
            year: props.match.params.year,
            found: null
        }
    }

    componentDidMount() {
        const BASE_URL = process.env.REACT_APP_CHRONOKEEP_API_URL;
        const requestOptions = {
            method: 'POST',
            body: JSON.stringify({ slug: this.state.slug, year: this.state.year }),
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + process.env.REACT_APP_CHRONOKEEP_ACCESS_TOKEN
            }
        }
        fetch(BASE_URL + 'results', requestOptions)
        .then(response => {
            if (response.status === 200) {
                this.setState({
                    status: response.status,
                    response: true
                });
            } else {
                this.setState({
                    error: true,
                    status: response.status,
                    response: true
                });
            }
            return response.json();
        })
        .then(data => {
            this.setState({
                loading: false,
                found: data,
                count: data.count,
                event: data.event,
                years: data.years,
                year: data.event_year,
                results: data.results
            });
        })
        .catch(error => {
            this.setState({
                error: true,
                errorMessage: error.toString()
            });
            console.error("There was an error!", error)
        })
    }

    render() {
        const qrValues = {
            value: this.state.value,
            ecLevel: 'H',
            size: 350,
            quietZone: 10, 
            bgColor: "#FFFFFF",
            fgColor: "#5c6c7d",
            qrStyle: "dots",
            eyeRadius: 20,
        }
        const state = this.state;
        document.title = `Chronokeep - QRCode`
        if (state.error === true) {
            document.title = `Chronokeep - Error`
            return (
                <div>
                    <Header page={"qrcode"} />
                    <ErrorMsg status={state.status} data={state.found} />
                    <Footer />
                </div>
            );
        }
        if (this.state.loading) {
            return (
                <div>
                    <Header page={"qrcode"} />
                    <div className="mx-auto sm-max-width text-center container-md border border-light p-5 pt-4">
                        <h1 className="text-important display-4">Verifying event exists.</h1>
                        <Loading />
                    </div>
                    <Footer />
                </div>
            );
        }
        document.title = `Chronokeep - ${state.year.year} ${state.event.name} QRCode`
        return (
            <div>
                <Header page={"qrcode"} />
                <div className="qr-holder">
                    <div className="qr-buffer" />
                    <h1 className="qr-label display-4">Results By</h1>
                    <QR {...{
                        ...qrValues
                    }} />
                    <h1 className="qr-label display-4">Chronokeep</h1>
                </div>
                <Footer />
            </div>
        )
    }
}

export default QRCode;