export function HeaderSearchForm() {
  return (
    <div id="search" ng-controller="SearchFormController" className="ng-scope">
      <form name="search" action="/search/" noValidate className="ng-pristine ng-valid">
        <input
          className="transparent ng-pristine ng-untouched ng-valid ng-empty"
          type="text"
          placeholder="Search station by name or genre..."
          name="filter"
          autoComplete="off"
          analytics-on="change"
          analytics-event="Search"
          analytics-category="Streams"
          analytics-label=""
        />
        <input mor-tooltip="Search" type="submit" value="" />
      </form>
    </div>
  );
}
