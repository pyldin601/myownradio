<?php

namespace Framework\Models;

use app\Services\Storage\StorageFactory;
use Framework\Exceptions\ApplicationException;
use Framework\Exceptions\ControllerException;
use Framework\Exceptions\UnauthorizedException;
use Framework\Models\Traits\Stats;
use Framework\Services\Config;
use Framework\Services\InputValidator;
use Objects\AccountPlan;
use Objects\Link;
use Objects\Payment;
use Objects\Stream;
use Objects\Track;
use Objects\User;
use REST\Users;
use Tools\Common;
use Tools\File;
use Tools\Folders;
use Tools\Singleton;
use Tools\SingletonInterface;

/**
 * Class UserModel
 * @package Model
 */
class UserModel extends Model implements SingletonInterface {

    use Stats, Singleton;

    protected $userID;

    /** @var User $user */
    private $user;

    /** @var AccountPlan $planObject */
    private $planObject, $planExpires;

    public function __construct() {

        parent::__construct();

        if (func_num_args() == 1 && is_numeric(func_get_arg(0))) {

            $id = func_get_arg(0);

            $this->user = User::getByID($id)->getOrElseThrow(
                new ControllerException(sprintf("User with id '%s' not exists", $id)));

        } elseif (func_num_args() == 1) {

            $key = func_get_arg(0);

            $this->user = User::getByFilter("FIND_BY_KEY_PARAMS", [":key" => $key])
                ->getOrElseThrow(
                    new ControllerException(sprintf("User with login or email '%s' not exists", $key))
                );

        } elseif (func_num_args() == 2) {

            $login = func_get_arg(0);
            $password = func_get_arg(1);

            $this->user = User::getByFilter("FIND_BY_CREDENTIALS", [":login" => $login, ":password" => $password])
                ->getOrElseThrow(UnauthorizedException::wrongLogin());

        } else {

            throw new \Exception("Incorrect number of arguments");

        }

        $this->loadAccountQuote();
        $this->userID = $this->user->getID();
        $this->loadStats();

    }

    public function loadAccountQuote() {
        $defaultPlan = AccountPlan::getByID(1)->get();
        /** @var Payment $actualPayment */
        $actualPayment = Payment::getByFilter("ACTUAL", [$this->getID()])->getOrElseNull();
        if ($actualPayment === null) {
            $this->planExpires = time();
            $this->planObject = $defaultPlan;
            return null;
        } else {
            $this->planExpires = $actualPayment->getExpires();
            $this->planObject = AccountPlan::getByID($actualPayment->getPlanId())->getOrElse($defaultPlan);
        }
    }

    /**
     * @return mixed
     * @deprecated
     */
    public function getCurrentPlanExpires() {
        return $this->planExpires;
    }

    /**
     * @return AccountPlan
     */
    public function getCurrentPlan() {
        return $this->planObject;
    }

    public function getID() {
        return $this->user->getID();
    }

    public function getLogin() {
        return $this->user->getLogin();
    }

    public function getEmail() {
        return $this->user->getEmail();
    }

    public function getName() {
        return $this->user->getName();
    }

    public function getPassword() {
        return $this->user->getPassword();
    }

    public function changePassword($newPassword, $oldPassword) {

        if (!password_verify($oldPassword, $this->user->getPassword())) {
            throw UnauthorizedException::wrongPassword();
        }

        $this->changePasswordNow($newPassword);

    }

    public function changePasswordNow($password) {
        $validator = InputValidator::getInstance();
        $validator->validatePassword($password);
        $crypt = password_hash($password, PASSWORD_DEFAULT);
        $this->user->setPassword($crypt)->save();
    }

    /**
     * @param AccountPlan $plan
     * @param $source
     * @param string $data
     */
    public function changeAccountPlan(AccountPlan $plan, $source, $data = "") {
        $payment = new Payment();
        $payment->setUserId($this->user->getID());
        $payment->setPlanId($plan->getPlanId());
        $payment->setPaymentSource($source);
        $payment->setPaymentComment($data);
        $payment->setExpires($this->planExpires + $plan->getPlanDuration());
        $payment->save();
    }

    public function getDisplayName() {

        return empty($this->getName()) ? $this->getLogin() : $this->getName();

    }

    public function edit($name, $info, $permalink, $country = 0) {

        $this->user->setName($name);
        $this->user->setInfo($info);
        $this->user->setPermalink($permalink);
        $this->user->setCountryId($country);

        $this->user->save();

    }

    public function removeAvatar()
    {
        if (!is_null($this->user->getAvatar())) {
            $storage = StorageFactory::getStorage();
            $path = 'avatars/' . $this->user->getAvatar();
            $storage->delete($path);
            $this->user->setAvatar(null);
            $this->user->save();
        }
    }

    public function changeAvatar($file)
    {
        $storage = StorageFactory::getStorage();

        $validator = InputValidator::getInstance();
        $validator->validateImageMIME($file["tmp_name"]);

        $this->removeAvatar();

        $random = Common::generateUniqueID();

        $extension = pathinfo($file["name"], PATHINFO_EXTENSION);

        $newImageFile = sprintf("avatar%05d_%s.%s", $this->userID, $random, strtolower($extension));
        $newImagePath = 'avatars/' . $newImageFile;

        $storage->put($newImagePath, fopen($file["tmp_name"], 'r'), [
            'ContentType' => mimetype_from_extension($extension)
        ]);

        $this->user->setAvatar($newImageFile);
        $this->user->save();

        return $storage->url($newImagePath);
    }

    /**
     * @return null|string
     */
    public function getAvatarUrl()
    {
        return $this->user->getAvatarUrl();
    }

    /**
     * @param $password
     * @throws UnauthorizedException
     */
    public function checkPassword($password)
    {
        if (!password_verify($password, $this->user->getPassword())) {
            throw UnauthorizedException::wrongPassword();
        }
    }

    /**
     * Account Delete
     * todo: Delete user's avatars and covers
     */
    public function delete() {

        /* Delete user's streams */
        $streams = Stream::getListByFilter("uid", [$this->user->getID()]);

        foreach ($streams as $stream) {
            $links = Link::getListByFilter("stream_id", [$stream->getID()]);
            foreach ($links as $link) {
                $link->delete();
            }
            $stream->delete();
        }

        /* Delete user's tracks */
        $tracks = Track::getListByFilter("uid", [$this->user->getID()]);

        foreach ($tracks as $track) {
            $model = new TrackModel($track->getID());
            $model->delete();
        }

        /* Delete account object */
        $this->user->delete();

    }

    public function touchLastLoginDate() {
        $this->user->setLastVisitDate(time())->save();
    }

    public function toRestFormat() {
        return Users::getInstance()->getUserByID($this->getID(), true);
    }

    /**
     * @return User
     */
    public function getUserObject() {
        return $this->user;
    }
}