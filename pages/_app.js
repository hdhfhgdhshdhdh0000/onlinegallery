import '../app/globals.css';
import Navbar from '../components/Navbar';

function MyApp({ Component, pageProps }) {
    const { isLoggedIn, user} = pageProps; 

    return (
        <>
            {!Component.hideNavbar && <Navbar isLoggedIn={isLoggedIn} user={user} />}
            <main>
                <Component {...pageProps} />
            </main>
        </>
    );
}

export default MyApp;
