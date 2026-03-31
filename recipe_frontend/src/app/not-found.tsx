import Link from 'next/link';

/**
 * Renders the application not-found page.
 *
 * @return {JSX.Element} The styled 404 page.
 */
export default function NotFound() {
    return (
        <main className='app-shell'>
            <div className='page-frame' style={{ paddingTop: '3rem', paddingBottom: '3rem' }}>
                <section className='hero-card'>
                    <div className='hero-card__content'>
                        <span className='hero-card__eyebrow'>404 Missing Recipe Card</span>
                        <h1>That page got lost in the pantry.</h1>
                        <p>
                            The recipe, profile, or collection you requested is not available right
                            now. Head back to the main board to keep cooking.
                        </p>
                        <div className='inline-actions'>
                            <Link href='/' className='primary-button'>
                                Return to Recipe Hub
                            </Link>
                        </div>
                    </div>
                    <div className='hero-card__visual'>
                        <div className='hero-illustration'>
                            <div className='hero-illustration__row'>
                                <div className='hero-illustration__card'>Missing card</div>
                                <div className='hero-illustration__card'>Try search</div>
                            </div>
                            <div className='hero-illustration__row'>
                                <div className='hero-illustration__card'>Browse tags</div>
                                <div className='hero-illustration__card'>Save favorites</div>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </main>
    );
}
