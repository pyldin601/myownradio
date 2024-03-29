<?php
/**
 * Created by PhpStorm.
 * UserModel: Roman
 * Date: 16.12.14
 * Time: 12:40
 */

namespace Framework\Handlers\api\v2\user;


use Framework\Controller;
use Framework\Models\LettersModel;
use Framework\Services\HttpPost;
use Framework\Services\JsonResponse;

class DoPasswordResetBegin implements Controller {

    public function doPost(HttpPost $post, JsonResponse $response) {

        $id = $post->getRequired("login");

        LettersModel::sendResetPasswordLetter($id);

    }

} 