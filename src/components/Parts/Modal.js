import React from 'react';

const Modal = ({ handleClose, show, save, text, title, saveText }) => {
    const showHideClassName = show ? "modal fade show display-block" : "modal fade";
    return (
        <div className={showHideClassName} tabIndex="-1" role="dialog" >
            <div className="modal-dialog modal-dialog-centered modal-sm" role="document">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">{title}</h5>
                        <button type="button" className="close" data-dismiss="modal" aria-label="Close" onClick={handleClose}>
                            <span aria-hidden="true">&times;</span>
                        </button>
                    </div>
                    <div className="modal-body">
                        {text}
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-primary" onClick={save}>{saveText}</button>
                        <button type="button" className="btn btn-secondary" onClick={handleClose}>Cancel</button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Modal;