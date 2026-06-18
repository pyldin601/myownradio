import Link from "next/link";

export function MainNavigation() {
  return (
    <div className="nav-wrap">
      <ul className="main-menu">
        <li>
          <Link href="/profile/">
            <i className="icon-account-child" />
            Profile
          </Link>
          <ul className="sub-menu">
            <li>
              <Link href="/profile/edit">Edit profile</Link>
            </li>
            <li>
              <Link href="/profile/password">Change password</Link>
            </li>
          </ul>
        </li>
        <li>
          <Link href="/profile/tracks/">
            <i className="icon-music" />
            Tracks
          </Link>
        </li>
        <li>
          <Link href="/profile/streams/">
            <i className="icon-wifi-tethering" />
            Stations
          </Link>
        </li>
      </ul>
    </div>
  );
}
