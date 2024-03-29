<?php
/**
 * Created by PhpStorm.
 * UserModel: Roman
 * Date: 17.12.14
 * Time: 10:15
 */

namespace Framework\Services\DB\Query;

use PDO;

/**
 * Interface QueryBuilder
 * @package MVC\Services\DB\Query
 */
interface QueryBuilder {
    public function getQuery(PDO $pdo);

    public function getParameters();
} 