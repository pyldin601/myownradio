<?php
/**
 * Created by PhpStorm.
 * User: Roman
 * Date: 01.02.15
 * Time: 7:26
 */

namespace Framework\Handlers\api\v2;


use Framework\Controller;
use Framework\Services\DB\DBQuery;
use Framework\Services\JsonResponse;

class DoGetCollection implements Controller {
    public function doGet(DBQuery $query, JsonResponse $response) {
        $response->setData([
            "countries"     => $query->selectFrom("mor_countries")->fetchAll(),
            "categories"    => $query->selectFrom("r_categories")->fetchAll(),
            "groups"        => $query->selectFrom("r_colors")->fetchAll(),
            "genres"        => $query->selectFrom("mor_genres")->fetchAll(),
            "access"        => $query->selectFrom("mor_access")->fetchAll()
        ]);
    }
} 