import Loading from '../Parts/Loading';
import ErrorMsg from '../Parts/ErrorMsg';
import DateString from '../Parts/DateString';
import { useParams } from 'react-router-dom';
import { ResultsLoader } from '../loaders/results';
import { PageProps } from '../Interfaces/props';

function Series(props: PageProps) {
    const params = useParams();
    const { state } = ResultsLoader(params, 'results');
    document.title = `Chronokeep - Results`
    if (state.error === true) {
        document.title = `Chronokeep - Error`
        return (
            <ErrorMsg status={state.status} message={state.message} />
        );
    }
    if (state.loading === true) {
        return (
            <Loading />
        );
    }
    const pageSubTitle = 'Series Results'
    document.title = `Chronokeep - ${state.event!.name} - ${pageSubTitle}`
    return (
        <div>
            <div className="row container-lg lg-max-width mx-auto d-flex mt-4 mb-3 align-items-stretch">
                <div className="col-md-10 flex-fill text-center mx-auto m-1">
                    <p className="text-important mb-0 mt-1 h1">{`${state.event!.name}`}</p>
                    <p className="text-important mb-2 mt-0 h2">{pageSubTitle}</p>
                    <p className="text-important h5">{DateString(state.year!.date_time)}</p>
                </div>
            </div>
        </div>
    )
}

export default Series;