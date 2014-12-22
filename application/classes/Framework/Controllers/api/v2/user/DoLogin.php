<?php
/**
 * Created by PhpStorm.
 * UserModel: Roman
 * Date: 15.12.14
 * Time: 9:50
 */

namespace Framework\Controllers\api\v2\user;


use Framework\Controller;
use Framework\Exceptions\ControllerException;
use Framework\Services\HttpPost;
use Framework\Services\JsonResponse;
use Model\UsersModel;

class DoLogin implements Controller {

    public function doPost(HttpPost $post, UsersModel $users, JsonResponse $response) {

        $login      = $post->getParameter("login")->getOrElseThrow(ControllerException::noArgument("login"));
        $password   = $post->getParameter("password")->getOrElseThrow(ControllerException::noArgument("password"));

        $users->authorizeByLoginPassword($login, $password);

    }

}