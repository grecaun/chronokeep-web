import { Component } from 'react';
import { QRCode as QR } from 'react-qrcode-logo';
import Header from '../Parts/Header';
import Footer from '../Parts/Footer';
import Loading from '../Parts/Loading';
import ErrorMsg from '../Parts/ErrorMsg';
import { useParams } from 'react-router-dom';
import { ParamProps } from '../Interfaces/props';
import { QRState } from '../Interfaces/states';
import { ErrorResponse, GetResultsResponse } from '../Interfaces/responses';

class QRCode extends Component<ParamProps, QRState> {
    state: QRState = {
        status: 0,
        value: '',
        loading: true,
        error: false,
        message: null,
        event: {
            name: '',
            slug: '',
            website: '',
            image: '',
            contact_email: '',
            access_restricted: false,
            type: '',
            recent_time: ''
        },
        year: undefined,
        page_name: ''
    }

    componentDidMount() {
        const params = this.props.params as { slug: string, year: string, bib: string }
        let year: string | undefined = params.year
        if (year === 'status') {
            year = undefined
        }
        const href = window.location.href.slice(0, window.location.href.length - 3)
        const pageName = window.location.href.split("/")[3]
        this.setState({
            value: href,
            page_name: pageName,
            year: year,
        })
        const BASE_URL = import.meta.env.VITE_CHRONOKEEP_API_URL;
        const requestOptions = {
            method: 'POST',
            body: JSON.stringify({ slug: params.slug, year: params.year }),
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + import.meta.env.VITE_CHRONOKEEP_ACCESS_TOKEN
            }
        }
        fetch(BASE_URL + 'results', requestOptions)
        .then(response => {
            if (response.status === 200) {
                this.setState({
                    status: response.status
                });
            } else {
                this.setState({
                    error: true,
                    status: response.status
                });
            }
            return response.json();
        })
        .then(data => {
            if (Object.prototype.hasOwnProperty.call(data, 'event_year')) {
                const dta = data as GetResultsResponse
                this.setState({
                    loading: false,
                    event: dta.event,
                    year: dta.event_year.year,
                });
            } else {
                const err = data as ErrorResponse
                this.setState({
                    loading: false,
                    error: true,
                    message: err.message
                })
            }
        })
        .catch(error => {
            this.setState({
                error: true
            });
            console.error("There was an error!", error)
        })
    }

    render() {
        const state = this.state;
        document.title = `Chronokeep - QRCode`
        if (state.error === true) {
            document.title = `Chronokeep - Error`
            return (
                <div>
                    <Header page={"qrcode"} />
                    <ErrorMsg status={state.status} message={state.message} />
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
        const codeName = state.year ? `${state.year} ${state.event.name}` :  `${state.event.name}`;
        document.title = `Chronokeep - ${codeName} QRCode`;
        return (
            <div>
                <Header page={"qrcode"} />
                <div className="qr-holder">
                    <div className="qr-buffer" />
                    <h1 className="qr-label display-4">{codeName}</h1>
                    <h1 className="qr-label display-4">{state.page_name === "awards" ? "Awards" : state.page_name === "status" ? "Status" : "Results"} By</h1>
                    <QR value={state.value} ecLevel='H' size={350} quietZone={10} bgColor='#FFFFFF' fgColor='#5c6c7d' qrStyle='dots' eyeRadius={20} />
                    <h1 className="qr-label display-4">Chronokeep</h1>
                </div>
                <Footer />
            </div>
        )
    }
}

const QRPage = () => (
    <QRCode
        params={useParams()}
    />);

export default QRPage;