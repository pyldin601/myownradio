<?php
/**
 * Created by PhpStorm.
 * UserModel: Roman
 * Date: 16.12.14
 * Time: 13:10
 */

namespace Model;


use MVC\Exceptions\UnauthorizedException;
use MVC\Services\Database;
use MVC\Services\HttpSession;
use MVC\Services\Injectable;
use Tools\Singleton;

class AuthUserModel extends UserModel {

    use Injectable;

    protected $userToken;

    function __construct() {
        $uid = $this->getIdBySessionToken();
        parent::__construct($uid);
    }

    public function getIdBySessionToken() {

        $exception = UnauthorizedException::noAccess();

        $token = HttpSession::getInstance()->get("TOKEN")->getOrElseThrow($exception);

        $uid = Database::doInConnection(function (Database $db) use ($token, $exception) {

            $query = $db->getDBQuery()
                ->selectFrom("r_sessions a")->innerJoin("r_users b", "a.uid = b.uid")
                ->select("*")
                ->where("a.token", $token);

            $id = $db->fetchOneColumn($query)->getOrElseThrow($exception);

            $this->userToken = $token;

            return $id;

        });

        return $uid;

    }


    public function getToken() {
        return $this->userToken;
    }

}