<?php
/**
 * Created by PhpStorm.
 * User: roman
 * Date: 20.12.14
 * Time: 14:22
 */

namespace MVC\Controllers\api\v2\stream;


use MVC\Controller;
use MVC\Exceptions\ControllerException;
use MVC\Services\HttpPost;
use MVC\Services\Services;

class DoRemoveCover extends Controller {

    public function doPost(HttpPost $post, Services $svc) {

        $id = $post->getParameter("id")
            ->getOrElseThrow(ControllerException::noArgument("id"));

        $svc->getStream($id)->removeCover();

    }

} 