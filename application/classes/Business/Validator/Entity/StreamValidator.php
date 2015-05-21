<?php
/**
 * Created by PhpStorm.
 * User: Roman
 * Date: 21.05.15
 * Time: 15:07
 */

namespace Business\Validator\Entity;


use Business\Validator\BusinessValidator;
use Business\Validator\Validator;
use Business\Validator\ValidatorException;
use Objects\Category;
use Objects\Stream;

/**
 * Class StreamValidator
 * @package Business\Validator\Entity
 */
class StreamValidator {

    private static $ACCESS_MODES = ["PUBLIC", "UNLISTED", "PRIVATE"];
    private static $INFO_MAX_LENGTH = 4096;
    private static $NAME_MIN_LENGTH = 3;
    private static $NAME_MAX_LENGTH = 32;

    /**
     * @param Stream $stream
     * @throws ValidatorException
     */
    public static function validate(Stream $stream) {
        self::validateStreamName($stream->getName());
        self::validateStreamPermalink($stream->getPermalink(), $stream->getID());
        self::validateAccessMode($stream->getAccess());
        self::validateStreamCategory($stream->getCategory());
        self::validateStreamInformation($stream->getInfo());
    }

    /**
     * @param $name
     * @throws ValidatorException
     */
    private static function validateStreamName($name) {
        (new BusinessValidator($name))
            ->minLength(self::$NAME_MIN_LENGTH)
            ->maxLength(self::$NAME_MAX_LENGTH)
            ->throwOnFail(StreamValidatorException::newStreamNameLength());
    }

    /**
     * @param $permalink
     * @param $ignore_self
     * @throws ValidatorException
     */
    private static function validateStreamPermalink($permalink, $ignore_self) {

        if (is_null($permalink)) {
            return;
        }

        (new BusinessValidator($permalink))
            ->isPermalink()
            ->throwOnFail(ValidatorException::tr("VALIDATOR_PERMALINK_CHARS"))
            ->isPermalinkAvailableForStream($ignore_self)
            ->throwOnFail(ValidatorException::tr("VALIDATOR_PERMALINK_USED"));

    }

    /**
     * @param $mode
     * @throws ValidatorException
     */
    private static function validateAccessMode($mode) {
        (new Validator($mode))->isExistsInArray(self::$ACCESS_MODES)
            ->throwOnFail(StreamValidatorException::newWrongAccessMode($mode));
    }

    /**
     * @param $category_id
     * @throws ValidatorException
     */
    private static function validateStreamCategory($category_id) {
        (new Validator($category_id))
            ->isNumber()
            ->isExistsInIterator(Category::getList()->getKeys())
            ->throwOnFail(StreamValidatorException::newWrongCategoryId($category_id));
    }

    /**
     * @param $info
     * @throws ValidatorException
     */
    private static function validateStreamInformation($info) {
        (new Validator($info))
            ->isString()
            ->maxLength(self::$INFO_MAX_LENGTH)
            ->throwOnFail(StreamValidatorException::newStreamInformationTooLong());
    }

}