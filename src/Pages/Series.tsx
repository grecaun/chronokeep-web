import Loading from '../Parts/Loading';
import ErrorMsg from '../Parts/ErrorMsg';
import { useParams } from 'react-router-dom';
import { MultiResultsLoader } from '../loaders/multi_results';
import { Series, SeriesDistance, SeriesResult, TimeResult } from '../Interfaces/types';
import SeriesResultsTable from '../Parts/SeriesResultsTable';

function SeriesPage() {
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
    const results = state.results;
    // Key == 'YEAR DISTANCE'
    const seriesMap: Map<string, Series> = new Map<string, Series>()
    // Key == 'YEAR DISTANCE'
    const seriesDistanceMap: Map<string, SeriesDistance> = new Map<string, SeriesDistance>()
    // Keep track of the # of races required to finish (Best 3 of ALL) -- Key == series name
    const seriesByName: Map<string, Series> = new Map<string, Series>()
    const distNames: Map<string, string[]> = new Map<string, string[]>()
    // Map used for keeping track of all participants and their results in the series
    const participants: Map<string, SeriesResult> = new Map<string, SeriesResult>()
    // Go through all of the Year + Distance combinations that we're looking for
    state.selected_year?.series.map(series => {
        seriesByName.set(series.name, series)
        series.distances.map(sDist => {
            seriesMap.set(`${sDist.year} ${sDist.name}`, series)
            seriesDistanceMap.set(`${sDist.year} ${sDist.name}`, sDist)
            if (!distNames.has(series.name)) {
                distNames.set(series.name, [])
            }
            distNames.get(series.name)!.push(`${sDist.year} ${sDist.name}`)
        })
    })
    // Go through the results for each year
    Object.keys(results).map(year => {
        // and each distance
        Object.keys(results[year]).map(distance => {
            // check if it's a part of the series
            const yearDistKey = `${year} ${distance}`
            if (seriesMap.has(yearDistKey)) {
                // Go through the list and record their result in a SeriesResult
                results[year][distance].map(result => {
                    if (result.finish && result.type !== 3 && result.type < 30) {
                        const name = `${result.first.toLocaleLowerCase()} ${result.last.toLocaleLowerCase()}`
                        if (!participants.has(name)) {
                            participants.set(name, {
                                first: result.first,
                                last: result.last,
                                gender: result.gender,
                                age: result.age,
                                age_group: result.age_group,
                                series_points: 0,
                                average_pace: 0,
                                pace_type: '',
                                results: new Map<string, TimeResult>(),
                                ranking: 0,
                                gender_ranking: 0,
                                age_ranking: 0
                            })
                        }
                        participants.get(name)!.results.set(yearDistKey, result)
                    }
                })
            }
        })
    })
    // Check which series they're in and put them in an array with their peers
    const seriesResults: { [index:string]: SeriesResult[] } = {}
    participants.forEach((res, name) => {
        // Count the number of events in each series the participant has completed
        const whichSeries: Map<string, number> = new Map<string, number>()
        res.results.forEach((_, yearDistKey) => {
            if (seriesMap.has(yearDistKey)) {
                if (!whichSeries.has(seriesMap.get(yearDistKey)!.name)) {
                    whichSeries.set(seriesMap.get(yearDistKey)!.name, 0)
                }
                whichSeries.set(seriesMap.get(yearDistKey)!.name, whichSeries.get(seriesMap.get(yearDistKey)!.name)! + 1)
            } else {
                console.error("Year + Distance not found in the Series Map when it should have been.")
            }
        })
        // figure out which series the person belongs to
        whichSeries.forEach((count, seriesName) => {
            if (count >= seriesByName.get(seriesName)!.best) {
                if (seriesResults[seriesName] === undefined) {
                    seriesResults[seriesName] = []
                }
                seriesResults[seriesName].push(participants.get(name)!)
            }
        })
    })
    // go through all of the results and rank the results for each event
    seriesByName.forEach((series, name) => {
        // Go through all of the series results and make sure every event for a person is part of that series
        seriesResults[name].map(oneRes => {
            Object.keys(oneRes.results).map(yearDistKey => {
                if (seriesMap.get(yearDistKey)!.name !== name) {
                    oneRes.results.delete(yearDistKey)
                }
            })
        })
        // Rank participants in every distance
        series.distances.map(dist => {
            const yearDistKey = `${dist.year} ${dist.name}`
            // go through the results for the series and sort by ranking/time for that event
            // put everyone who didn't participate in that event at the bottom
            seriesResults[name].sort((a,b) => {
                if (!a.results.has(yearDistKey) && !b.results.has(yearDistKey)) {
                    return 0
                }
                // Push results that have a result for that year to the top
                if (a.results.has(yearDistKey) && !b.results.has(yearDistKey)) {
                    return -1
                }
                if (b.results.has(yearDistKey) && !a.results.has(yearDistKey)) {
                    return 1
                }
                if (a.results.get(yearDistKey)!.ranking == a.results.get(yearDistKey)!.ranking) {
                    if (a.results.get(yearDistKey)!.seconds === b.results.get(yearDistKey)!.seconds) {
                        return a.results.get(yearDistKey)!.milliseconds - b.results.get(yearDistKey)!.milliseconds
                    }
                    return a.results.get(yearDistKey)!.seconds - b.results.get(yearDistKey)!.seconds
                }
                return a.results.get(yearDistKey)!.ranking - b.results.get(yearDistKey)!.ranking
            })
            var ranking: number = 1
            seriesResults[name].map(res => {
                if (res.results.has(yearDistKey)) {
                    res.results.get(yearDistKey)!.ranking = ranking
                    ranking += 1
                    // set pace -- use DIVISION for mi/km designation and DIVISION_RANKING for pace in seconds
                    res.results.get(yearDistKey)!.division = seriesDistanceMap.get(yearDistKey)!.type
                    res.results.get(yearDistKey)!.division_ranking = Math.floor(res.results.get(yearDistKey)!.seconds / seriesDistanceMap.get(yearDistKey)!.value)
                }
            })
        })
        // Calculate total event points and average pace
        seriesResults[name].map(res => {
            const rankings: number[] = []
            const paces: number[] = []
            res.results.forEach(tRes => {
                rankings.push(tRes.ranking)
                paces.push(tRes.division_ranking)
                res.pace_type = tRes.division
            })
            rankings.sort((a,b) => { return a - b })
            paces.sort((a,b) => { return a - b })
            // ensure they've completed enough races to count
            if (seriesByName.has(name) && (rankings.length >= seriesByName.get(name)!.best || paces.length >= seriesByName.get(name)!.best)) {
                for (var i=0; i<seriesByName.get(name)!.best; i++) {
                    res.series_points += rankings[i]
                    res.average_pace += paces[i]
                }
                res.average_pace = Math.floor(res.average_pace / seriesByName.get(name)!.best)
            }
        })
        // Sort results by event points -> average pace
        seriesResults[name].sort((a,b) => {
            if (a.series_points === b.series_points) {
                return a.average_pace - b.average_pace
            }
            return a.series_points - b.series_points
        })
        var ranking: number = 1;
        var gender_ranking: Map<string, number> = new Map<string, number>()
        var age_ranking: Map<string, number> = new Map<string, number>()
        seriesResults[name].map(result => {
            if (!gender_ranking.has(result.gender)) {
                gender_ranking.set(result.gender, 1)
            }
            if (!age_ranking.has(`${result.gender}${result.age_group}`)) {
                age_ranking.set(`${result.gender}${result.age_group}`, 1)
            }
            result.ranking = ranking
            result.gender_ranking = gender_ranking.get(result.gender)!
            result.age_ranking = age_ranking.get(`${result.gender}${result.age_group}`)!
            ranking += 1
            gender_ranking.set(result.gender, gender_ranking.get(result.gender)!+1)
            age_ranking.set(`${result.gender}${result.age_group}`, age_ranking.get(`${result.gender}${result.age_group}`)!+1)
        })
    })
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
            { Object.keys(seriesResults).length > 0 &&
            <div id="results-parent">
                { Object.keys(seriesResults).map(series => {
                    return (
                        <SeriesResultsTable
                            name={series}
                            results={seriesResults[series]}
                            distances={distNames.get(series)!}
                            show_title={Object.keys(seriesResults).length > 1}
                            search={""}
                            key={series}
                            />
                    )
                })}
            </div>
            }
        </div>
    )
}

export default SeriesPage;