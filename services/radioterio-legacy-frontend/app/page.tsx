import Link from "next/link";

export default function HomeRoute() {
  return (
    <>
      <header>
        <div id="hd">
          <div className="fixed-width">
            <div id="logo">
              <Link href="/">Radioterio</Link>
            </div>
            <div id="buttons">
              <Link href="/login/">Login</Link>
              <Link href="/signup">Sign up</Link>
            </div>
          </div>
        </div>
      </header>

      <div id="contents">
        <div id="body">
          <main className="home-page fixed-width">
            <section className="home-intro">
              <h1>Your own web radio station</h1>
              <p>
                Phase 0 shell is ready. Legacy routes, components, global
                styles, and API wiring can now be migrated into this structure.
              </p>
              <div className="buttons">
                <Link className="button" href="/streams/">
                  Browse stations
                </Link>
                <Link className="button secondary" href="/profile/">
                  Open dashboard
                </Link>
              </div>
            </section>
          </main>
        </div>
      </div>

      <footer>
        <div className="fixed-width">
          <a href="mailto:support@radioter.io">support@radioter.io</a>
          <span>Radioterio (ex. myownradio.biz) &copy; 2014-2026</span>
        </div>
      </footer>
    </>
  );
}
