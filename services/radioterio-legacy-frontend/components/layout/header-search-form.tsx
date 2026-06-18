export function HeaderSearchForm() {
  return (
    <div id="search">
      <form name="search" action="/search/" noValidate>
        <input
          className="transparent"
          type="text"
          placeholder="Search stations"
          name="filter"
          autoComplete="off"
        />
        <input type="submit" value="" aria-label="Search" />
      </form>
    </div>
  );
}
