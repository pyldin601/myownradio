import Link from "next/link";
import { Translate } from "@/components/legacy/translate";

export default function HomeRoute() {
  return (
    <div ng-view="" autoscroll="" className="ng-scope">
      <div className="hello-page ng-scope">
        <div className="fixed-width">
          <div className="big-description">
            <div className="dark-background">
              <Translate>
                Create your own web radio station
                <br />
                or discover dozens of existing.
              </Translate>
            </div>
            <div className="main-actions">
              <Link
                className="page-button"
                href="/streams/"
                mor-tooltip="Click here to browse existing radio stations"
              >
                <Translate>Listen to the Radio</Translate>
              </Link>
              {" "}
              <span className="only-first-element">
                <Link
                  className="page-button ng-scope"
                  href="/login"
                  ng-switch-when="false"
                >
                  <Translate>Log in to the service</Translate>
                </Link>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
