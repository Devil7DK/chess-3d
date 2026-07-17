import { Link } from 'react-router-dom';

export const MainMenu = () => {
    return (
        <div className='main-menu'>
            <h1>3D Chess</h1>
            <nav>
                <button type='button' disabled>
                    Single Player
                    <span>Coming soon</span>
                </button>
                <Link to='/play'>2 Player (Single Screen)</Link>
                <button type='button' disabled>
                    2 Player (Remote)
                    <span>Coming soon</span>
                </button>
            </nav>
        </div>
    );
};
