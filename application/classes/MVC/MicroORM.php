<?php
/**
 * Created by PhpStorm.
 * User: Roman
 * Date: 18.12.14
 * Time: 9:31
 */

namespace MVC;


use Model\Beans\BeanObject;
use MVC\Exceptions\ORMException;
use MVC\Services\Database;
use Tools\Singleton;

/**
 * Class MicroORM
 * @package MVC
 */
class MicroORM {

    use Singleton;

    /**
     * @param string $bean
     * @param int $id
     * @return object
     */
    public function fetchObject($bean, $id) {

        $reflection = new \ReflectionClass($bean);

        $beanComment = $reflection->getDocComment();
        $beanConfig = $this->getBeanConfig($beanComment);

        return $this->_loadObject($reflection, $beanConfig, $id);

    }

    public function getListOfObjects($bean, $limit = null, $offset = null) {

        $reflection = new \ReflectionClass($bean);

        $beanComment = $reflection->getDocComment();
        $beanConfig = $this->getBeanConfig($beanComment);

        return $this->_loadObjects($reflection, $beanConfig, null, null, $limit, $offset);

    }

    public function doActionOnObject($bean, $filter, $filterArgs = null, $limit = null, $offset = null) {

        $reflection = new \ReflectionClass($bean);

        $beanComment = $reflection->getDocComment();
        $beanConfig = $this->getBeanConfig($beanComment);

        if (!isset($beanConfig["@do" . $filter])) {
            throw new ORMException("No action '" . $filter . "' found");
        }

        return $this->_loadObjects($reflection, $beanConfig, $beanConfig["@do" . $filter], $filterArgs, $limit, $offset);

    }

    /**
     * @param BeanObject $bean
     * @return mixed
     * @throws ORMException
     */
    public function saveObject(BeanObject $bean) {

        $reflection = new \ReflectionClass($bean);

        $beanComment = $reflection->getDocComment();
        $beanConfig = $this->getBeanConfig($beanComment);

        if (isset($beanConfig["@readOnly"])) {
            throw new ORMException("Save not allowed");
        }

        return Database::doInConnection(function (Database $db) use ($reflection, $beanConfig, $bean) {

            $keyProp = $reflection->getProperty($beanConfig["@key"]);
            $keyProp->setAccessible(true);

            $key = $keyProp->getValue($bean);

            if (is_null($key)) {

                $query = $db->getDBQuery()->insertInto($beanConfig["@table"]);

                foreach ($reflection->getProperties() as $prop) {
                    if ($prop->getName() == $beanConfig["@key"])
                        continue;
                    $prop->setAccessible(true);
                    $query->values($prop->getName(), $prop->getValue($bean));
                }

                $result = $db->executeInsert($query);

            } else {

                $query = $db->getDBQuery()->updateTable($beanConfig["@table"]);

                foreach ($reflection->getProperties() as $prop) {

                    $prop->setAccessible(true);

                    if ($prop->getName() == $beanConfig["@key"]) {

                        $query->where($prop->getName(), $prop->getValue($bean));

                    } else {

                        $query->set($prop->getName(), $prop->getValue($bean));

                    }

                }

                $result = $db->executeUpdate($query);

            }

            $db->commit();

            return $result;

        });

    }

    /**
     * @param \ReflectionClass $reflection
     * @param array $config
     * @param int $id
     * @return object $bean
     */
    private function _loadObject($reflection, $config, $id) {

        $object = Database::doInConnection(function (Database $db) use ($reflection, $config, $id) {
            $query = $db->getDBQuery()->selectFrom($config["@table"])
                ->select($config["@table"] . ".*")->where($config["@key"], $id);

            if (isset($config["@leftJoin"], $config["@on"])) {
                $query->leftJoin($config["@leftJoin"], $config["@on"]);
                $query->select($config["@leftJoin"] . ".*");
            }

            $row = $db->fetchOneRow($query)
                ->getOrElseThrow(
                    new ORMException(sprintf("No object '%s' with key '%s' exists", $config["@table"], $id))
                );

            $instance = $reflection->newInstance();

            foreach ($reflection->getProperties() as $prop) {
                $prop->setAccessible(true);
                $prop->setValue($instance, @$row[$prop->getName()]);
            }

            return $instance;

        });

        return $object;

    }

    /**
     * @param \ReflectionClass $reflection
     * @param $config
     * @param string|null $filter
     * @param array|null $filterArgs
     * @param int|null $limit
     * @param int|null $offset
     * @return mixed
     */
    private function _loadObjects($reflection, $config, $filter = null, $filterArgs = null, $limit = null,
                                                                                                    $offset = null) {

        $objects = Database::doInConnection(function (Database $db)
                                            use ($filter, $filterArgs, $reflection, $config, $offset, $limit) {

            $array = [];

            $query = $db->getDBQuery()->selectFrom($config["@table"])
                ->select($config["@table"] . ".*");

            if (isset($config["@leftJoin"], $config["@on"])) {
                $query->leftJoin($config["@leftJoin"], $config["@on"]);
                $query->select($config["@leftJoin"] . ".*");
            }

            if (is_numeric($limit)) {
                $query->limit($limit);
            }

            if (is_numeric($offset)) {
                $query->offset($offset);
            }

            if (is_string(($filter))) {
                $query->where($filter, $filterArgs);
            } else {
                $query->where("1");
            }

            $rows = $db->fetchAll($query);

            foreach($rows as $row) {

                $instance = $reflection->newInstance();

                foreach ($reflection->getProperties() as $prop) {
                    $prop->setAccessible(true);
                    $prop->setValue($instance, @$row[$prop->getName()]);
                }

                $array[] = $instance;

            }

            return $array;

        });

        return $objects;

    }

    /**
     * @param string $comments
     * @return array
     */
    private function parseDocComments($comments) {
        $parameters = [];
        preg_match_all("~(\\@\\w+)\\s+(.+)~m", $comments, $matches, PREG_SET_ORDER);
        foreach ($matches as $match) {
            $parameters[$match[1]] = trim($match[2]);
        }
        return $parameters;
    }

    /**
     * @param string $beanComment
     * @return array
     * @throws Exceptions\ORMException
     */
    private function getBeanConfig($beanComment) {

        $beanConfig = $this->parseDocComments($beanComment);

        if (empty($beanConfig["@table"])) {
            throw new ORMException("No 'table' comment present");
        }

        if (empty($beanConfig["@key"])) {
            throw new ORMException("No 'key' comment present");
        }

        return $beanConfig;

    }
} 