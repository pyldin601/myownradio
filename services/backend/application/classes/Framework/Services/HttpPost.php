<?php
/**
 * Created by PhpStorm.
 * UserModel: roman
 * Date: 13.12.14
 * Time: 18:26
 */

namespace Framework\Services;

use Framework\Exceptions\ControllerException;
use Framework\Injector\Injectable;
use Tools\Optional;
use Tools\Singleton;
use Tools\SingletonInterface;

class HttpPost extends HttpRequestAdapter implements Injectable, SingletonInterface {

    use Singleton;

    public function getParameter($key, $filter = FILTER_DEFAULT, $options = null) {
        return Optional::ofEmpty(FILTER_INPUT(INPUT_POST, $key, $filter, $options));
    }

    public function getArrayParameter($key, $filter = FILTER_DEFAULT) {
        $array = FILTER_INPUT_ARRAY(INPUT_POST, [
            $key => [
                "filter" => $filter,
                "flags"  => FILTER_REQUIRE_ARRAY
            ]
        ]);
        return Optional::ofArray($array[$key]);
    }

    public function getRequired($key, $filter = FILTER_DEFAULT, $options = null) {
        return $this->getParameter($key, $filter, $options)
            ->getOrElseThrow(ControllerException::noArgument($key));
    }

    public function getArrayRequired($key, $definition = null) {
        return $this->getArrayParameter($key, $definition)
            ->getOrElseThrow(ControllerException::noArgument($key));
    }

}