import { ModalProps } from "../Interfaces/props";

function Modal(props: ModalProps) {
    const showHideClassName = props.show ? "modal fade show display-block" : "modal fade";
    return (
        <div className={showHideClassName} tabIndex={-1} role="dialog" >
            <div className="modal-dialog modal-dialog-centered modal-sm" role="document">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">{props.title}</h5>
                        <button type="button" className="close" data-dismiss="modal" aria-label="Close" onClick={() => { props.handleClose() }}>
                            <span aria-hidden="true">&times;</span>
                        </button>
                    </div>
                    <div className="modal-body" id={props.id}>
                        {props.text}
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-primary" onClick={() => { props.save() }}>{props.saveText}</button>
                        <button type="button" className="btn btn-secondary" onClick={() => { props.handleClose() }}>Cancel</button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Modal;