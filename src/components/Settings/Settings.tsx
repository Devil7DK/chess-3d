import { PresetsType } from '@react-three/drei/helpers/environment-assets';
import { useEffect, useRef, useState } from 'react';

import { BoardMode } from '../../types';

export interface ISettingsProps {
    environment: PresetsType;
    onChangeEnvironment: (env: PresetsType) => void;
    boardMode: BoardMode;
    onChangeBoardMode: (mode: BoardMode) => void;
}

export const Settings = ({
    environment,
    onChangeEnvironment,
    boardMode,
    onChangeBoardMode,
}: ISettingsProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const panelRef = useRef<HTMLDivElement>(null);

    // Close settings panel when clicking outside of it
    useEffect(() => {
        if (!isOpen) return;

        const handleClickOutside = (event: MouseEvent) => {
            if (
                panelRef.current &&
                !panelRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    return (
        <div className='settings-wrapper'>
            <div className='settings-container' ref={panelRef}>
                <button
                    type='button'
                    className='settings-button'
                    title='Settings'
                    onClick={() => setIsOpen((prev) => !prev)}
                >
                    <svg viewBox='0 0 24 24'>
                        <path d='M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z' />
                    </svg>
                </button>
                {isOpen && (
                    <div className='settings-panel'>
                        <h3>Settings</h3>
                        <div className='setting-item'>
                            <label htmlFor='settings-board-select'>Board</label>
                            <select
                                id='settings-board-select'
                                value={boardMode}
                                onChange={(e) =>
                                    onChangeBoardMode(
                                        e.target.value as BoardMode,
                                    )
                                }
                            >
                                <option value='3d'>3D</option>
                                <option value='2d'>2D</option>
                            </select>
                        </div>
                        {/* The environment only lights the 3D scene */}
                        {boardMode === '3d' && (
                            <div className='setting-item'>
                                <label htmlFor='settings-environment-select'>
                                    Environment
                                </label>
                                <select
                                    id='settings-environment-select'
                                    value={environment}
                                    onChange={(e) =>
                                        onChangeEnvironment(
                                            e.target.value as PresetsType,
                                        )
                                    }
                                >
                                    <option value='sunset'>Sunset</option>
                                    <option value='dawn'>Dawn</option>
                                    <option value='night'>Night</option>
                                    <option value='warehouse'>Warehouse</option>
                                    <option value='forest'>Forest</option>
                                    <option value='apartment'>Apartment</option>
                                    <option value='studio'>Studio</option>
                                    <option value='city'>City</option>
                                    <option value='park'>Park</option>
                                    <option value='lobby'>Lobby</option>
                                </select>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};
