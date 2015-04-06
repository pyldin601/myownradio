<?php
/**
 * Created by PhpStorm.
 * User: roman
 * Date: 05.04.15
 * Time: 15:15
 */

namespace Framework\Controllers\api\v2\channels;


use API\REST\ChannelsCollection;
use Framework\Controller;
use Framework\Exceptions\ControllerException;
use Framework\Models\AuthUserModel;
use Framework\Services\HttpGet;
use Framework\Services\JsonResponse;
use Objects\User;

class DoMy implements Controller {
    public function doGet(HttpGet $get, ChannelsCollection $collection, JsonResponse $response, AuthUserModel $model) {
        $offset = $get->getParameter("offset", FILTER_VALIDATE_INT)->getOrElse(0);
        $limit = $get->getParameter("limit", FILTER_VALIDATE_INT)->getOrElseNull();

        $response->setData([
            "user" => $model->toRestFormat(),
            "channels" => $collection->getChannelsListBySelf($offset, $limit)
        ]);
    }
} 