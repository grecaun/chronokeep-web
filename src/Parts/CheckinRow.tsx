import { useState } from "react"
import { CheckinRowProps } from "../Interfaces/props"

function CheckinRow(props: CheckinRowProps) {
    const [state, setState] = useState({ expanded: false })

    const handleClick = () => {
        setState({
            expanded: !state.expanded
        })
        console.log(state.expanded)
    }
    const part = props.participant
    if (state.expanded) {
        return (
            <div className="row" key={`${part.id}`} onClick={handleClick}>
                <div className='' id={`part-forms-${part.id}`}>I was hidden!</div>
            </div>
        );
    }
    
    return (
        <div className="row" key={`${part.id}`} onClick={handleClick}>
            <div className='' id={`part-label-${part.id}`}>{`${part.first} ${part.last}`}</div>
        </div>
    );
}

export default CheckinRow