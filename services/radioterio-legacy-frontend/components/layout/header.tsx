import Link from "next/link";
import { HeaderSearchForm } from "./header-search-form";

export function Header() {
  return (
    <header>
      <div id="hd">
        <div className="fixed-width">
          <div id="buttons">
            <span>
              <Link href="/login/">Login</Link>
              <Link href="/signup">Sign up</Link>
            </span>
          </div>

          <h2 id="logo" className="left border-box">
            <Link href="/">
              <i className="mor-logo" />
              RADIOTERIO
            </Link>
          </h2>

          <HeaderSearchForm />

          <div id="links">
            <Link className="border-box" href="/streams/">
              Streams
            </Link>
            <Link className="border-box" href="/categories/">
              Categories
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
