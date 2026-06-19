import Link from "next/link";

export function Footer() {
  return (
    <footer>
      <div className="footer-background">
        <div className="footer-content fixed-width">
          <ul className="footer-content-list">
            <li>
              <Link href="/">Home</Link> | <Link href="/streams/">Browse channels</Link>{" "}
              |{" "}
              <a href="mailto:support@radioter.io">
                Report problem or ask question
              </a>{" "}
              | <a>Radioterio (ex. myownradio.biz) &copy; 2014-2023</a>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
