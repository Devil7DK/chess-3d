import { Environment } from '@react-three/drei';
import React, { PropsWithChildren, Suspense } from 'react';

import { EnvironmentPreset } from '../../types';
import { getEnvironmentUrl } from '../../utils';

interface IBoundaryState {
    failed: boolean;
}

/**
 * Keeps a broken environment from taking the scene with it — a failure while
 * decoding the HDRI throws during render, and without this the whole canvas
 * would unmount.
 */
class EnvironmentBoundary extends React.Component<
    PropsWithChildren,
    IBoundaryState
> {
    state: IBoundaryState = { failed: false };

    static getDerivedStateFromError(): IBoundaryState {
        return { failed: true };
    }

    componentDidCatch(error: unknown) {
        console.warn(
            'Environment failed to load, continuing without it',
            error,
        );
    }

    render() {
        return this.state.failed ? null : this.props.children;
    }
}

export interface ISceneEnvironmentProps {
    preset: EnvironmentPreset;
}

/**
 * Image-based lighting, isolated behind its own Suspense boundary.
 *
 * The HDRI is bundled (see `src/assets/hdri`) instead of coming from drei's
 * CDN, but it is still a separate file fetched on demand — anything sharing a
 * Suspense boundary with it would not render until it lands. Inside `<Stage>`
 * that meant an empty canvas with no error and no spinner. Here the board
 * draws immediately and the lighting only improves once it arrives.
 */
export const SceneEnvironment = ({ preset }: ISceneEnvironmentProps) => {
    const files = getEnvironmentUrl(preset);

    if (!files) return null;

    return (
        <EnvironmentBoundary>
            <Suspense fallback={null}>
                <Environment files={files} />
            </Suspense>
        </EnvironmentBoundary>
    );
};
