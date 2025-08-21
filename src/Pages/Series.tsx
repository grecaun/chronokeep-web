import Loading from '../Parts/Loading';
import ErrorMsg from '../Parts/ErrorMsg';
import { useParams } from 'react-router-dom';
import { MultiResultsLoader } from '../loaders/multi_results';

function Series() {
    const params = useParams();
    const { state } = MultiResultsLoader(params, 'results');
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
    console.log(state.results)
    const pageSubTitle = 'Series Results'
    document.title = `Chronokeep - ${state.event!.name} - ${pageSubTitle}`
    return (
        <div>
            <div className="row container-lg lg-max-width mx-auto d-flex mt-4 mb-3 align-items-stretch">
                <div className="col-md-10 flex-fill text-center mx-auto m-1">
                    <p className="text-important mb-0 mt-1 h1">{`${state.event!.name}`}</p>
                    <p className="text-important mb-2 mt-0 h2">{pageSubTitle}</p>
                    <p className="text-important h5">{state.selected_year?.display_year === undefined? '' : state.selected_year?.display_year}</p>
                </div>
            </div>
        </div>
    )
}

export default Series;