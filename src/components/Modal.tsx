"use client";

import { XMarkIcon } from '@heroicons/react/24/solid';
import { Fragment } from 'react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) {
        return null;
    }

    return (
        <Fragment>
            <div
                className="fixed inset-0 bg-black bg-opacity-75 z-40"
                onClick={onClose}
            />

            <div
                className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gray-800 rounded-lg shadow-xl z-50 w-full max-w-md p-6"
            >
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-white">{title}</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-white"
                    >
                        <XMarkIcon className="w-6 h-6" />
                    </button>
                </div>
                <div>
                    {children}
                </div>
            </div>
        </Fragment>
    );
};

export default Modal;