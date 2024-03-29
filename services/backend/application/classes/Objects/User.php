<?php
/**
 * Created by PhpStorm.
 * UserModel: Roman
 * Date: 18.12.14
 * Time: 14:48
 */

namespace Objects;

use Framework\Services\ORM\EntityUtils\ActiveRecord;
use Framework\Services\ORM\EntityUtils\ActiveRecordObject;
use REST\Users;
use Tools\Folders;

/**
 * Class User
 * @package Model\ActiveRecords
 * @table r_users
 * @key uid
 *
 * @do_FIND_BY_KEY_PARAMS login = :key OR mail = :key
 * @do_FIND_BY_CREDENTIALS (login = :login) AND (password = :password)
 * @do_FIND_BY_KEY (uid = :key) OR (permalink = :key AND permalink IS NOT NULL)
 */
class User extends ActiveRecordObject implements ActiveRecord {

//    const INACTIVE_USER_RIGHT = 0;
//    const ACTIVE_USER_RIGHT = 1;
//    const BANNED_USER_RIGHT = 2;
//    const DELETED_USER_RIGHT = 3;
    const SUPER_USER_RIGHT = 9;

    protected
        $uid                = null,
        $mail               = "",
        $login              = null,
        $password           = null,
        $name               = null,
        $info               = null,
        $rights             = null,
        $registration_date  = null,
        $last_visit_date    = null,
        $permalink          = "",
        $avatar             = null,
        $country_id         = null;

    /**
     * @return bool
     */
    public function isSuperUser() {
        return $this->getRights() == self::SUPER_USER_RIGHT;
    }

    /**
     * @return mixed
     */
    public function getAvatar() {
        return $this->avatar;
    }

    /**
     * @return mixed
     */
    public function getInfo() {
        return $this->info;
    }

    /**
     * @return mixed
     */
    public function getLastVisitDate() {
        return $this->last_visit_date;
    }

    /**
     * @return mixed
     */
    public function getLogin() {
        return $this->login;
    }

    /**
     * @return mixed
     */
    public function getEmail() {
        return $this->mail;
    }

    /**
     * @return mixed
     */
    public function getName() {
        return $this->name;
    }

    /**
     * @return mixed
     */
    public function getPassword() {
        return $this->password;
    }

    /**
     * @return mixed
     */
    public function getPermalink() {
        return $this->permalink;
    }

    /**
     * @return mixed
     */
    public function getRegistrationDate() {
        return $this->registration_date;
    }

    /**
     * @return mixed
     */
    public function getRights() {
        return $this->rights;
    }

    /**
     * @return mixed
     */
    public function getID() {
        return $this->uid;
    }


    /**
     * @param mixed $avatar
     * @return $this
     */
    public function setAvatar($avatar) {
        $this->avatar = $avatar;
        return $this;
    }

    /**
     * @param mixed $info
     * @return $this
     */
    public function setInfo($info) {
        $this->info = $info;
        return $this;
    }

    /**
     * @param mixed $last_visit_date
     * @return $this
     */
    public function setLastVisitDate($last_visit_date) {
        $this->last_visit_date = $last_visit_date;
        return $this;
    }

    /**
     * @param mixed $login
     * @return $this
     */
    public function setLogin($login) {
        $this->login = $login;
        return $this;
    }

    /**
     * @param mixed $mail
     * @return $this
     */
    public function setEmail($mail) {
        $this->mail = $mail;
        return $this;
    }

    /**
     * @param mixed $name
     * @return $this
     */
    public function setName($name) {
        $this->name = $name;
        return $this;
    }

    /**
     * @param mixed $password
     * @return $this
     */
    public function setPassword($password) {
        $this->password = $password;
        return $this;
    }

    /**
     * @param mixed $permalink
     * @return $this
     */
    public function setPermalink($permalink) {
        $this->permalink = $permalink;
        return $this;
    }

    /**
     * @param mixed $registration_date
     * @return $this
     */
    public function setRegistrationDate($registration_date) {
        $this->registration_date = $registration_date;
        return $this;
    }

    /**
     * @param mixed $rights
     * @return $this
     */
    public function setRights($rights) {
        $this->rights = $rights;
        return $this;
    }

    /**
     * @param mixed $uid
     * @return $this
     */
    public function setUid($uid) {
        $this->uid = $uid;
        return $this;
    }

    public function getKey() {
        return isset($this->permalink) ? $this->permalink : $this->uid;
    }

    public function getAvatarUrl() {
        return Folders::getInstance()->genAvatarUrl($this->avatar);
    }

    /* Added 31.01.2015 */

    /**
     * @param mixed $countryId
     */
    public function setCountryId($countryId) {
        $this->country_id = $countryId;
    }

    /**
     * @return mixed
     */
    public function getCountryId() {
        return $this->country_id;
    }

    /**
     * @return mixed
     */
    public function toRestFormat() {
        return Users::getInstance()->getUserByID($this->getID());
    }

}
