export function BusyOverlay() {
  return (
    <div className="busy-wrap table ngCloak" hidden>
      <div className="row">
        <div className="cell">
          <i className="icon-spinner9 rotate" />
          <br />
          <div className="loading">Loading</div>
        </div>
      </div>
    </div>
  );
}
