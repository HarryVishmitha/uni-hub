import React from 'react';

const AppLayout = ({ children }) => {
    return (
        <div className="app-layout">
            <header>
                <h1>App Header</h1>
            </header>
            <main>
                {children}
            </main>
            <footer>
                <p>App Footer</p>
            </footer>
        </div>
    );
};

export default AppLayout;
