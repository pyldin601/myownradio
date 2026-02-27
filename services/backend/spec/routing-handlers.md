# Routing Handlers Spec

This spec describes how to add routing handlers for:
- Backend server router (PHP)
- Frontend AngularJS router (ngRoute)

The references below match current code in this repo.

## Backend (server router)

### How routing is resolved
- Entry point is `services/backend/public/index.php`, which sets `$_GET['route']` from the request path.
- `Framework\Services\CurrentRoute` converts the path into a handler class name. The last path segment becomes `Do<Segment>`.
- `Framework\Router::callRoute()` builds the class name by prefixing `Framework/Handlers/` (from `CONTROLLERS_ROOT`) and invoking the handler method based on HTTP verb (`doGet`, `doPost`, `doPut`, `doDelete`).
- If no direct handler exists, `Framework\Services\SubRouter` is used for legacy/SPA-style routes and regex matching.

### Create a new handler (direct route)
1. Choose a URL path. Example: `/api/v2/streams/getList`.
2. Create a handler class under `services/backend/application/classes/Framework/Handlers/...` matching the path.
   Example class path: `services/backend/application/classes/Framework/Handlers/api/v2/streams/DoGetList.php`.
   Namespace must match the directory: `Framework\Handlers\api\v2\streams`.
3. Implement `Framework\Controller` (or extend `Framework\ControllerImpl`).
4. Add a public method for the HTTP verb, e.g. `doGet`, `doPost`.

Minimal example:
```php
<?php

namespace Framework\Handlers\api\v2\streams;

use Framework\Controller;
use Framework\Services\HttpGet;
use Framework\Services\JsonResponse;

class DoExample implements Controller {
    public function doGet(HttpGet $get, JsonResponse $response) {
        $response->setData(["ok" => true]);
    }
}
```

Route-to-class mapping rules:
- Path `/api/v2/streams/getList` -> class `Framework\Handlers\api\v2\streams\DoGetList`.

### Add a SubRouter route (regex/SPA routes)
SubRouter is used for legacy and SPA page routes (e.g. `/profile`, `/signup/:code`).

1. Add the route in `services/backend/application/classes/Framework/Router.php` inside `registerSubRoutes()`.
2. Use one of these methods: `addRoute('path/:param', 'namespace\\DoHandler')`, `addRouteRegExp('~^regex$~', 'namespace\\DoHandler')`, `addRoutes([...], 'namespace\\DoHandler')`.
3. Dynamic params: `:param` matches any non-slash string, `&param` matches digits only.
4. Access params via `Framework\Services\RouteParams` or `Framework\Services\HttpGet`.

Example:
```php
$sub->addRoute('streams/:id', 'helpers\\DoStream');
```

Handler can read params:
```php
use Framework\Services\HttpGet;

public function doGet(HttpGet $get) {
    $id = $get->getRequired('id');
}
```

## Frontend (AngularJS router)

The frontend AngularJS app is defined in `services/backend/public/js/mor-modules/main.ang.js`.

### Where routes live
- Routes are defined in the `routes` object and exported via `md.constant("ROUTES", routes)`.
- All routes are registered in `md.config(...)` by iterating over the `ROUTES` constant.
- `ngRoute` is used with `html5Mode(true)` and `hashPrefix('!')`.

### Add a new AngularJS route
1. Add a new entry to the `routes` object in `services/backend/public/js/mor-modules/main.ang.js`.
2. Provide the path and route config (template, controller, resolve, etc.).
3. Keep paths consistent with backend SubRouter for SPA pages.

Example:
```js
PATH_EXAMPLE: ["/example/:id", {
    templateUrl: "/views/example.html",
    controller: "ExampleController",
    title: "Example on " + SITE_TITLE,
    needsAuth: true
}],
```

Notes:
- Use `resolve` blocks when data must be loaded before view render.
- `ROUTES` keys are arbitrary constants; the path and config are what matter.
- A default 404 route is configured via `$routeProvider.otherwise({ templateUrl: "/views/404.html" })`.

## Cross-checks
- Backend routes are executed by handler classes under `services/backend/application/classes/Framework/Handlers/`.
- Frontend routes are defined in `services/backend/public/js/mor-modules/main.ang.js` and should match the SPA entry points registered in the backend SubRouter.
