import { Component } from "react";
import { Event } from "../Interfaces/types";
import { EventListProps } from "../Interfaces/props";
import { EventListState } from "../Interfaces/states";
import right from '/img/chevron-right.svg';
import left from '/img/chevron-left.svg';
import { Link } from "react-router-dom";

class EventList extends Component<EventListProps, EventListState> {
    state: EventListState = {
        events: [],
        page: 0,
    }

    componentDidMount() {
        this.setState({
            events: this.props.events.sort((a: Event, b: Event) => Date.parse(b.recent_time) - Date.parse(a.recent_time))
        })
    }

    render () {
        const state = this.state;
        const itemsPerPage = 5
        const totalPages = Math.ceil(state.events.length / itemsPerPage) - 1
        const start = state.page * itemsPerPage
        const end = start + itemsPerPage > state.events.length ? state.events.length : start + itemsPerPage
        const pageNumbers = [];
        if (totalPages <= 5) {
            for (let ix = 0; ix <= totalPages; ix++) {
                if (state.page === ix) {
                    pageNumbers.push(<a className="chronokeep-pagination-active nav-link m-2 p-1 chronokeep-pagination-link active" key={ix}>{ix + 1}</a>)
                } else {
                    pageNumbers.push(<a className="nav-link m-2 p-1 chronokeep-pagination-link" onClick={() => this.setState({page:ix})} key={ix}>{ix + 1}</a>)
                }
            }
        } else {
            if (state.page === 0) {
                pageNumbers.push(<a className="chronokeep-pagination-active nav-link m-2 p-1 chronokeep-pagination-link active" key={0}>1</a>)
                pageNumbers.push(<a className="nav-link m-2 p-1 chronokeep-pagination-link" onClick={() => {this.setState({page:1})}} key={1}>2</a>)
                pageNumbers.push(<a className="nav-link m-2 p-1 chronokeep-pagination-link" onClick={() => {this.setState({page:2})}} key={2}>3</a>)
                pageNumbers.push(<a className="chronokeep-pagination-link m-2" key={3}>…</a>)
                pageNumbers.push(<a className="nav-link m-2 p-1 chronokeep-pagination-link" onClick={() => {this.setState({page:totalPages-2})}} key={4}>{totalPages-1}</a>)
                pageNumbers.push(<a className="nav-link m-2 p-1 chronokeep-pagination-link" onClick={() => {this.setState({page:totalPages-1})}} key={5}>{totalPages}</a>)
                pageNumbers.push(<a className="nav-link m-2 p-1 chronokeep-pagination-link" onClick={() => {this.setState({page:totalPages})}} key={6}>{totalPages+1}</a>)
            } else if (state.page === totalPages) {
                pageNumbers.push(<a className="nav-link m-2 p-1 chronokeep-pagination-link" onClick={() => {this.setState({page:0})}} key={0}>1</a>)
                pageNumbers.push(<a className="nav-link m-2 p-1 chronokeep-pagination-link" onClick={() => {this.setState({page:1})}} key={1}>2</a>)
                pageNumbers.push(<a className="nav-link m-2 p-1 chronokeep-pagination-link" onClick={() => {this.setState({page:2})}} key={2}>3</a>)
                pageNumbers.push(<a className="chronokeep-pagination-link m-2" key={3}>…</a>)
                pageNumbers.push(<a className="nav-link m-2 p-1 chronokeep-pagination-link" onClick={() => {this.setState({page:totalPages-2})}} key={4}>{totalPages-1}</a>)
                pageNumbers.push(<a className="nav-link m-2 p-1 chronokeep-pagination-link" onClick={() => {this.setState({page:totalPages-1})}} key={5}>{totalPages}</a>)
                pageNumbers.push(<a className="chronokeep-pagination-active nav-link m-2 p-1 chronokeep-pagination-link active" key={6}>{totalPages+1}</a>)
            } else if (state.page === 1) {
                pageNumbers.push(<a className="nav-link m-2 p-1 chronokeep-pagination-link" onClick={() => {this.setState({page:0})}} key={0}>1</a>)
                pageNumbers.push(<a className="chronokeep-pagination-active nav-link m-2 p-1 chronokeep-pagination-link active" key={1}>2</a>)
                pageNumbers.push(<a className="nav-link m-2 p-1 chronokeep-pagination-link" onClick={() => {this.setState({page:2})}} key={2}>3</a>)
                pageNumbers.push(<a className="nav-link m-2 p-1 chronokeep-pagination-link" onClick={() => {this.setState({page:3})}} key={3}>4</a>)
                pageNumbers.push(<a className="chronokeep-pagination-link m-2" key={4}>…</a>)
                pageNumbers.push(<a className="nav-link m-2 p-1 chronokeep-pagination-link" onClick={() => {this.setState({page:totalPages-1})}} key={5}>{totalPages}</a>)
                pageNumbers.push(<a className="nav-link m-2 p-1 chronokeep-pagination-link" onClick={() => {this.setState({page:totalPages})}} key={6}>{totalPages+1}</a>)
            } else if (state.page === totalPages - 1) {
                pageNumbers.push(<a className="nav-link m-2 p-1 chronokeep-pagination-link" onClick={() => {this.setState({page:0})}} key={0}>1</a>)
                pageNumbers.push(<a className="nav-link m-2 p-1 chronokeep-pagination-link" onClick={() => {this.setState({page:1})}} key={1}>2</a>)
                pageNumbers.push(<a className="chronokeep-pagination-link m-2" key={2}>…</a>)
                pageNumbers.push(<a className="nav-link m-2 p-1 chronokeep-pagination-link" onClick={() => {this.setState({page:totalPages-3})}} key={3}>{totalPages-2}</a>)
                pageNumbers.push(<a className="nav-link m-2 p-1 chronokeep-pagination-link" onClick={() => {this.setState({page:totalPages-2})}} key={4}>{totalPages-1}</a>)
                pageNumbers.push(<a className="chronokeep-pagination-active nav-link m-2 p-1 chronokeep-pagination-link active" key={5}>{totalPages}</a>)
                pageNumbers.push(<a className="nav-link m-2 p-1 chronokeep-pagination-link" onClick={() => {this.setState({page:totalPages})}} key={6}>{totalPages+1}</a>)
            } else {
                pageNumbers.push(<a className="nav-link m-2 p-1 chronokeep-pagination-link" onClick={() => {this.setState({page:0})}} key={0}>1</a>)
                pageNumbers.push(<a className="chronokeep-pagination-link m-2" key={1}>…</a>)
                pageNumbers.push(<a className="nav-link m-2 p-1 chronokeep-pagination-link" onClick={() => {this.setState({page:state.page-1})}} key={2}>{state.page}</a>)
                pageNumbers.push(<a className="chronokeep-pagination-active nav-link m-2 p-1 chronokeep-pagination-link active" key={3}>{state.page+1}</a>)
                pageNumbers.push(<a className="nav-link m-2 p-1 chronokeep-pagination-link" onClick={() => {this.setState({page:state.page+1})}} key={4}>{state.page+2}</a>)
                pageNumbers.push(<a className="chronokeep-pagination-link m-2" key={5}>…</a>)
                pageNumbers.push(<a className="nav-link m-2 p-1 chronokeep-pagination-link" onClick={() => {this.setState({page:totalPages})}} key={6}>{totalPages+1}</a>)
            }
        }

        return (
            <div className="event-list card chronokeep-card">
                <div className="event-list-content">
                    { state.events.slice(start, end).map(ev => {
                        return (
                            <div className="event-list-event" key={ev.slug}>
                                { ev &&
                                    <Link to={`/checkin/${ev.slug}`} className="nav-link m-2 p-1" key={ev.slug}>{ev.name}</Link>
                                }
                            </div>
                        );
                    })
                    }
                </div>
                <div className="event-list-navigate">
                    <button className="btn btn-danger btn-chronokeep m-2" name="previous" onClick={() => {
                        this.setState({
                            page: state.page > 0 ? state.page - 1 : 0,
                        })
                    }} disabled={state.page === 0}>
                        <img src={left} alt="previous" />
                    </button>
                    {pageNumbers}
                    <button className="btn btn-danger btn-chronokeep m-2" name="next" onClick={() => {
                        this.setState({
                            page: state.page < totalPages ? state.page + 1 : totalPages
                        })
                    }} disabled={state.page >= totalPages}>
                        <img src={right} alt="next" />
                    </button>
                </div>
            </div>
        )
    }
}

export default EventList