import { useRef, useEffect } from "react";
import "./modal.css"

//The modal props are the arguments that the Modal component will receive upon every use.

interface ModalProps {
  isOpen: boolean; // A boolean that determines whether the modal is open or closed.
  hasCloseButton?: boolean; // An optional boolean that determines whether the modal has a close button.
  onClose?: () => void; // An optional function that will be called when the modal is closed.
  children: React.ReactNode; // The content to be displayed inside the modal.
}

const Modal: React.FC<ModalProps> = ({ isOpen, hasCloseButton = true, onClose, children }) => {
  const modalRef = useRef<HTMLDialogElement>(null);

  //The useEffect is used to load the modal when the isOpen state is true.
  //It is defined as a resusable component, called in different places in the app, and the isOpen state is passed as an argument to it, so that it can be used to open or close the modal.
  useEffect(() => {
    try {
      const modalElement = modalRef.current;
      if (!modalElement) return;

      if (isOpen) {
        modalElement.showModal();
        document.body.style.overflow = 'hidden'; //prevent the background from scrolling when the modal is open
      } else {
        modalElement.close();
        document.body.style.overflow = 'auto'; //restore the background scrolling when the modal is closed
      }
    } catch (e) {
      const modalElement = modalRef.current; 
      modalElement?.setAttribute("open", "");
    }
  }, [isOpen]);

  const handleCloseModal = () => { //The function is called when the modal is closed. It checks if the onClose function is defined, and if it is, it calls it.
    if (onClose) {
      onClose();
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDialogElement>) => { //responds to the escape key to close the  modal when it is open.
    if (event.key === "Escape") {
      handleCloseModal();
    }
  };

  const handleDialogClick =(event: React.MouseEvent<HTMLDialogElement>)=>{ //when a user clicks outside the modal, it closes.
    if (event?.target === modalRef.current){
        handleCloseModal();
    }
  }

  return (
    <dialog ref={modalRef} onKeyDown={handleKeyDown} className="modal" onClick={handleDialogClick}> {/* //handles the click event on the dialog to close the modal when a user clicks outside of it. */}
      {hasCloseButton && (
        <button className="modal-close-btn" onClick={handleCloseModal}>
          X
        </button>
      )}

      {children}
    </dialog>
  );
};

export default Modal;