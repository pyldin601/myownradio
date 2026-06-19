export function BusyOverlay() {
  return (
    <div className="busy-wrap table ngCloak ng-hide" ng-show="loader.busy === true">
      <div className="row">
        <div className="cell">
          <i className="icon-spinner9 rotate" />
          <br />
          <div className="loading ng-isolate-scope">WORKING...</div>
        </div>
      </div>
    </div>
  );
}
