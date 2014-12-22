<?php
/**
 * Created by PhpStorm.
 * User: Roman
 * Date: 22.12.14
 * Time: 17:57
 */

namespace Framework\Controllers\api\v2\tracks;


use Framework\Controller;
use Framework\Exceptions\ControllerException;
use Framework\Services\HttpGet;
use Framework\Services\JsonResponse;
use REST\Playlist;

class DoGetNowPlaying implements Controller {
    public function doGet(HttpGet $get, Playlist $playlist, JsonResponse $response) {
        $id = $get->getParameter("stream_id")->getOrElseThrow(ControllerException::noArgument("stream_id"));
        $response->setData($playlist->getNowPlaying($id));
    }
} 