import "../Style/Confirm.css"
import { useConfirm } from './ConfirmContextProvider'

const Confirm = () => {
    const { confirm, hideConfirm } = useConfirm();

    const getIcon = () => {
        return <span style={{ fontSize: '24px', fontWeight: 'bold', fontFamily: 'Segoe UI, sans-serif' }}>i</span>;
    };

    return (
        <>
            <div className={`confirm ${confirm.show ? "active" : ''} ${confirm.type} ${confirm.theme}`}>
                <button className="close-btn" onClick={hideConfirm} data-tooltip="Close Dialog">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                        <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z" />
                    </svg>
                </button>

                <div className="confirm-content">
                    <div className="confirm-icon">
                        {getIcon()}
                    </div>
                    <div className="confirm-message">
                        {confirm.title && <h3>{confirm.title}</h3>}
                        <p>{confirm.message}</p>
                    </div>
                </div>

                <div className='btns-container'>
                    <button className='approve' onClick={() => {
                        hideConfirm();
                        confirm.onApprove();
                    }}>{confirm.confirmText || 'Yes'}</button>
                    <button className='decline' onClick={() => {
                        hideConfirm();
                        confirm.onDecline();
                    }}>{confirm.cancelText || 'No'}</button>
                </div>
            </div>
            {confirm.show && <div className='confirm-background' onClick={hideConfirm}></div>}
        </>
    )
}

export default Confirm
