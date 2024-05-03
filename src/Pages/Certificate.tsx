import { useParams } from "react-router-dom";
import { TimeResult } from "../Interfaces/types";
import { PersonLoader } from "../loaders/person";
import FormatTime from "../Parts/FormatTime";
import DateString from "../Parts/DateString";
import { toPng } from "html-to-image";

function Certificate() {
    const params = useParams();
    const state = PersonLoader(params);
    document.title = `Finisher Certificate`;

    let finish: TimeResult | null = null;
    for (const res of state.results) {
        if (res.finish && state.event.type !== "time") {
            finish = res;
        }
    }

    let name: string = `${state.person.first} ${state.person.last}`;
    let event: string = `${state.event.name}`;
    if (state.single_distance === false) {
        event = `${state.event.name} ${state.person.distance}`;
    }
    let time: string = ``;
    if (finish !== null) {
        time = FormatTime(finish.chip_seconds, finish.chip_milliseconds, finish, true, true);
    }
    let date: string = DateString(state.year.date_time);

    return (
        CertificateGenerator(name, event, time, date)
    )
}

export function CertificateGenerator(
    name: string,
    event: string,
    time: string,
    date: string,
    displayCert: boolean = true
) {
    const downloadImage = async () => {
        try {
            let certificate = document.getElementById("certificate");
            if (certificate !== null) {
                certificate.style.display = "block";
                const dataUrl = await toPng(certificate);
                const link = document.createElement('a');
                link.download = 'finisher-certificate.png';
                link.href = dataUrl;
                link.click();
                certificate.style.display = displayCert ? "block" : "none";
            }
        }
        catch {
            console.error("unable to download image");
        }
    }

    const displ: string = displayCert === true ? "" : "chronokeep-invisible";

    return (
        <div>
            { displayCert === false &&
                <div className="mx-auto fit-width mt-3">
                    <button className="btn btn-danger btn-chronokeep" onClick={downloadImage}>Download Finisher Certificate</button>
                </div>
            }
            <div className="mx-auto fit-width mt-3">
                <div id="certificate" className={`certificate-container ${displ}`}>
                    <div className="certificate-wrapper">
                        <div className="certificate-name">{name}</div>
                        <div className="certificate-event-distance">finished the {event} with a time of</div>
                        <div className="certificate-time">{time}</div>
                        <div className="certificate-date">on this day of {date}</div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Certificate