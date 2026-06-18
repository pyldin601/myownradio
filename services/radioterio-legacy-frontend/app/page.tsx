import Link from "next/link";

export default function HomeRoute() {
  return (
    <main className="home-page fixed-width">
      <section className="home-intro">
        <h1>Your own web radio station</h1>
        <p>
          Phase 1 shell is ready. Legacy assets, global styles, and layout
          components are in place for route-by-route migration.
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
  );
}
