<?php
/**
 * Created by PhpStorm.
 * User: Roman
 * Date: 25.02.15
 * Time: 11:16
 */

namespace Framework\View\Errors;


use Framework\Exceptions\ApplicationException;
use Framework\ObjectTrait;

class ViewException extends ApplicationException {

    use ObjectTrait;

    protected $code;
    protected $body;

    public function render() {
        http_response_code($this->code);
        echo $this->body;
    }

} 