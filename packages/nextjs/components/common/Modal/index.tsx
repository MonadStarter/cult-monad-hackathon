"use client";

import React, { ReactNode, useEffect, useState } from "react";
import ModalContainer from "./ModalContainer";
import { isBoolean } from "lodash";
import { CrossIcon } from "~~/icons/actions";

function Modal({
  buttonClassName,
  buttonIcon,
  containerClassName,
  buttonText,
  children,
  backdropClose,
  hideCloseButton,
  darkenBackdrop,
  forceClose,
  title = "",
}: {
  buttonClassName?: string;
  containerClassName?: string;
  buttonText?: string;
  children: ReactNode;
  title?: string;
  buttonIcon?: ReactNode;
  backdropClose?: boolean;
  hideCloseButton?: boolean;
  darkenBackdrop?: boolean;
  forceClose?: boolean;
}) {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const toggleModal = (open?: boolean) => {
    if (isBoolean(open)) setIsModalOpen(open);
    if (!isModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "scroll";
    }
    setIsModalOpen(isModalOpen => !isModalOpen);
  };

  useEffect(() => {
    if (!forceClose) return;
    setIsModalOpen(false);
    document.body.style.overflow = "scroll";
  }, [forceClose]);

  return (
    <div>
      <button onClick={() => toggleModal()} className={buttonClassName}>
        {buttonText} {buttonIcon}
      </button>
      <ModalContainer
        darkenBackdrop={darkenBackdrop}
        className={containerClassName}
        open={isModalOpen}
        onBackdropClick={backdropClose ? () => toggleModal() : undefined}
      >
        <>
          <div className="flex gap-12 items-center justify-between">
            <h4 className="text-xl">{title}</h4>
            {!hideCloseButton && (
              <button className="bg-transparent !py-1" onClick={() => toggleModal()}>
                <CrossIcon />
              </button>
            )}
          </div>
          {children}
        </>
      </ModalContainer>
    </div>
  );
}

export default Modal;
