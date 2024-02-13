import { Component } from "react";
import { ModalProps } from "../Interfaces/props";

class Modal extends Component<ModalProps> {
    render() {
        const showHideClassName = this.props.show ? "modal fade show display-block" : "modal fade";
        return (
            <div className={showHideClassName} tabIndex={-1} role="dialog" >
                <div className="modal-dialog modal-dialog-centered modal-sm" role="document">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">{this.props.title}</h5>
                            <button type="button" className="close" data-dismiss="modal" aria-label="Close" onClick={this.props.handleClose}>
                                <span aria-hidden="true">&times;</span>
                            </button>
                        </div>
                        <div className="modal-body" id={this.props.id}>
                            {this.props.text}
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-primary" onClick={this.props.save}>{this.props.saveText}</button>
                            <button type="button" className="btn btn-secondary" onClick={this.props.handleClose}>Cancel</button>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

export default Modal;