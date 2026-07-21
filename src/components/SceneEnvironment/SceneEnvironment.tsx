import { Environment } from '@react-three/drei';
import { PresetsType } from '@react-three/drei/helpers/environment-assets';
import React, { PropsWithChildren, Suspense } from 'react';

interface IBoundaryState {
    failed: boolean;
}

/**
 * Keeps a broken environment from taking the scene with it. drei fetches
 * HDR presets from a third-party CDN, and an outright failure throws during
 * render — without this the whole canvas would unmount.
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
    preset: PresetsType;
}

/**
 * Image-based lighting, isolated behind its own Suspense boundary.
 *
 * The HDR comes from a CDN, and if that request hangs — as it does when the
 * host cannot be resolved — anything sharing a Suspense boundary with it
 * never renders. Inside `<Stage>` that meant an empty canvas with no error
 * and no spinner. Here the board draws immediately and the environment only
 * improves the lighting once (if) it arrives.
 */
export const SceneEnvironment = ({ preset }: ISceneEnvironmentProps) => (
    <EnvironmentBoundary>
        <Suspense fallback={null}>
            <Environment preset={preset} />
        </Suspense>
    </EnvironmentBoundary>
);
