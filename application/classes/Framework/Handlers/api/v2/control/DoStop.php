<?php
/**
 * Created by PhpStorm.
 * User: Roman
 * Date: 19.12.14
 * Time: 16:30
 */

namespace Framework\Handlers\api\v2\control;


use Framework\Controller;
use Framework\Models\PlaylistModel;
use Framework\Services\HttpPost;
use Framework\Services\JsonResponse;
use Framework\Services\Notifier;

class DoStop implements Controller {

    public function doPost(HttpPost $post, JsonResponse $response, Notifier $notif1er) {

        $id = $post->getRequired("stream_id");

        PlaylistModel::getInstance($id)->scStop();

        $notif1er->event("channel", $id, "stop", null);

    }

} 