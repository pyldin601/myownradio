<?php
/**
 * Created by PhpStorm.
 * User: roman
 * Date: 13.12.14
 * Time: 20:39
 */

namespace MVC\Exceptions;


use Exception;

class DocNotFoundException  extends \Exception {
    public function __construct() {
        parent::__construct();
    }

}