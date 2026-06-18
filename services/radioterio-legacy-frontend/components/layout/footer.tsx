import Link from "next/link";

export function Footer() {
  return (
    <footer>
      <div className="footer-background">
        <div className="footer-content fixed-width">
          <ul className="footer-content-list">
            <li>
              <Link href="/">Home</Link> | <Link href="/streams/">Browse stations</Link>{" "}
              | <a href="mailto:support@radioter.io">Report question</a> |{" "}
              <a>Radioterio (ex. myownradio.biz) &copy; 2014-2026</a>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
