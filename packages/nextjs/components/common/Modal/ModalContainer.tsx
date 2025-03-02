"use client";

import { ReactNode } from "react";

function ModalContainer({ children, className, open, darkenBackdrop, onBackdropClick}: {
    children?: ReactNode,
    className?: string
    open: boolean,
    darkenBackdrop?: boolean,
    onBackdropClick?: () => void;
}) {

     return (
        <div 
            onClick={onBackdropClick}
            className={`absolute transition-all ease-in-out duraction-300 ${!open && "hidden"} h-screen z-10 inset-0 flex items-center justify-center ${darkenBackdrop ?"bg-black/50 backdrop-blus-lg" : "bg-black/30 backdrop-blur-sm"}`}>
            <div className={`modal ${className}`}>
                {children}
            </div>
        </div>
    );
}

export default ModalContainer;