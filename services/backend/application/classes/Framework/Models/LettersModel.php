<?php
/**
 * Created by PhpStorm.
 * UserModel: Roman
 * Date: 16.12.14
 * Time: 13:21
 */

namespace Framework\Models;


use app\Config\Config;
use app\Services\EmailService;
use Framework\Exceptions\ControllerException;
use Framework\Services\Locale\L10n;
use Framework\Template;

class LettersModel {

    public static function sendRegistrationLetter($email) {

        $i18n = L10n::getInstance();
        $emailService = EmailService::getInstance();
        $config = Config::getInstance();

        $domain = $config->getWebServerOwnAddress();
        $code = md5($email . "@radioter.io@" . $email);
        $confirm = base64_encode(json_encode(['email' => $email, 'code' => $code, 'domain' => $domain]));

        $template = new Template("locale/{$i18n->getLocale()}.reg.request.mail.tmpl");
        $template->addVariable("confirm", $confirm);
        $template->addVariable("domain", $domain);

        try {
            $emailService->send($email, $i18n->get("EMAIL_REG_TITLE"), $template->render());
        } catch (\Exception $exception) {
            throw new ControllerException($exception->getMessage());
        }

    }

    public static function sendRegistrationCompleted($email) {

        $i18n = L10n::getInstance();
        $emailService = EmailService::getInstance();
        $domain = $config->getWebServerOwnAddress();

        $template = new Template("locale/{$i18n->getLocale()}.reg.complete.tmpl");

        $template->addVariable("domain", $domain);

        try {
            $emailService->send($email, $i18n->get("EMAIL_REG_COMPLETED"), $template->render());
        } catch (\Exception $exception) {
            throw new ControllerException($exception->getMessage());
        }
        
    }

    public static function sendResetPasswordLetter($id) {

        $i18n = L10n::getInstance();
        $emailService = EmailService::getInstance();

        $user = new UserModel($id);

        $code = base64_encode(json_encode(["login" => $user->getLogin(), "password" => $user->getPassword()]));
        $domain = $config->getWebServerOwnAddress();

        $template = new Template("locale/{$i18n->getLocale()}.reset.password.tmpl");

        $template->addVariable("name", $user->getDisplayName());
        $template->addVariable("login", $user->getLogin());
        $template->addVariable("code", $code);
        $template->addVariable("domain", $domain);

        try {
            $emailService->send($user->getEmail(), $i18n->get("EMAIL_PASSWORD_RESET"), $template->render());
        } catch (\Exception $exception) {
            throw new ControllerException($exception->getMessage());
        }

    }

} 
