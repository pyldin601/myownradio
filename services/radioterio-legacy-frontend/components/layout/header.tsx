import Link from "next/link";
import { Translate } from "@/components/legacy/translate";
import { HeaderSearchForm } from "./header-search-form";

export function Header() {
  return (
    <header>
      <div id="hd">
        <div className="fixed-width">
          <div id="buttons">
            <span ng-hide="account.authorized">
              <Link href="/login" mor-tooltip="Log in to the service">
                <Translate>Login</Translate>
              </Link>
              {" "}
              <Link href="/signup" mor-tooltip="Create account">
                <Translate>Sign Up</Translate>
              </Link>
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
            <Link
              className="border-box ng-isolate-scope"
              href="/streams/"
              mor-tooltip="Browse popular radio stations"
              active-tab="^\/streams\/"
            >
              <Translate>Stations</Translate>
            </Link>
            <Link
              className="border-box ng-isolate-scope"
              href="/categories/"
              mor-tooltip="Browse categories"
              active-tab="^\/categories\/"
            >
              <Translate>Categories</Translate>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
