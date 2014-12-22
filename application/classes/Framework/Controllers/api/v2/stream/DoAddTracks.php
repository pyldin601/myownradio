<?php
/**
 * Created by PhpStorm.
 * UserModel: roman
 * Date: 14.12.14
 * Time: 18:25
 */

namespace Framework\Controllers\api\v2\stream;


use Framework\Controller;
use Framework\Exceptions\ControllerException;
use Framework\Services\HttpPost;
use Framework\Services\InputValidator;
use Framework\Services\JsonResponse;
use Model\PlaylistModel;

class DoAddTracks implements Controller {
    public function doPost(HttpPost $post, InputValidator $validator, JsonResponse $response) {

        $id = $post->getParameter("id")->getOrElseThrow(ControllerException::noArgument("id"));
        $tracks = $post->getParameter("tracks")->getOrElseThrow(ControllerException::noArgument("tracks"));

        $validator->validateTracksList($tracks);

        PlaylistModel::getInstance($id)->addTracks($tracks);

    }
} 