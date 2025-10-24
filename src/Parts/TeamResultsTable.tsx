import { TeamResultTableProps } from '../Interfaces/props';
import { TeamResult } from '../Interfaces/types';
import FormatTime from './FormatTime';

function TeamResultsTable(props: TeamResultTableProps) {
    const results = props.results;
    const distance = props.distance;
    const showTitle = props.show_title;

    const sorted = results.sort((a: TeamResult, b: TeamResult) => {
        // Lower points are ranked higher.
        if (a.firstWoman !== undefined && a.secondWoman !== undefined && a.thirdResult !== undefined && a.fourthResult !== undefined &&
            b.firstWoman !== undefined && b.secondWoman !== undefined && b.thirdResult !== undefined && b.fourthResult !== undefined) {
            return a.points - b.points
        }
        // If a is a valid entry but b is not, rank it higher.
        if (a.firstWoman !== undefined && a.secondWoman !== undefined && a.thirdResult !== undefined && a.fourthResult !== undefined) {
            return -1
        }
        // Otherwise a is invalid and b can be ranked higher.
        return 1
    })
    let ranking: number = 1
    sorted.map(result => {
        if (result.firstWoman !== undefined && result.secondWoman !== undefined && result.thirdResult !== undefined && result.fourthResult !== undefined) {
            result.ranking = ranking
            ranking += 1
        } else {
            result.ranking = 0
        }
    })
    return (
        <div className="table-responsive-sm m-3" key={distance} id={distance}>
            <table className="table table-sm">
                <thead>
                    { showTitle &&
                    <tr>
                        <th className="table-distance-header text-important text-center" colSpan={7}>{distance}</th>
                    </tr>
                    }
                    <tr>
                        <th className="col-sm text-center">Place</th>
                        <th className="col-lg">Team Name</th>
                        <th className="col-sm text-center">Points</th>
                        <th className="overflow-hidden-sm col-md text-center">1 W</th>
                        <th className="overflow-hidden-sm col-md text-center">2 W</th>
                        <th className="overflow-hidden-sm col-md text-center">3</th>
                        <th className="overflow-hidden-sm col-md text-center">4</th>
                    </tr>
                </thead>
                <tbody>
                    { sorted.map(result => {
                        return(
                            <tr key={result.ranking}>
                                <td className="text-center">{result.ranking}</td>
                                <td>{result.name}</td>
                                <td className="text-center">{result.points}</td>
                                <td className="overflow-hidden-sm text-center">{`${result.firstWoman?.first} ${result.firstWoman?.last} - ${result.firstWoman?.ranking}`}<br/>{`${FormatTime(result.firstWoman!.seconds, result.firstWoman!.milliseconds, result.firstWoman!)}`}</td>
                                <td className="overflow-hidden-sm text-center">{`${result.secondWoman?.first} ${result.secondWoman?.last} - ${result.secondWoman?.ranking}`}<br/>{`${FormatTime(result.secondWoman!.seconds, result.secondWoman!.milliseconds, result.secondWoman!)}`}</td>
                                <td className="overflow-hidden-sm text-center">{`${result.thirdResult?.first} ${result.thirdResult?.last} - ${result.thirdResult?.ranking}`}<br/>{`${FormatTime(result.thirdResult!.seconds, result.thirdResult!.milliseconds, result.thirdResult!)}`}</td>
                                <td className="overflow-hidden-sm text-center">{`${result.fourthResult?.first} ${result.fourthResult?.last} - ${result.fourthResult?.ranking}`}<br/>{`${FormatTime(result.fourthResult!.seconds, result.fourthResult!.milliseconds, result.fourthResult!)}`}</td>
                            </tr>
                        )
                    })}
                </tbody>
            </table>
        </div>
    )
}

export default TeamResultsTable