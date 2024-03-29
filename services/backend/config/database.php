<?php

return [

    'connections' => [

        'mysql' => [
            'driver' => 'mysql',
            'host' => env('DB_HOST', ''),
            'port' => env('DB_PORT', '3306'),
            'database' => env('DB_DATABASE', 'mor'),
            'username' => env('DB_USERNAME', 'root'),
            'password' => env('DB_PASSWORD', ''),
            'attributes' => [
                PDO::ATTR_EMULATE_PREPARES => false,
//                PDO::ATTR_PERSISTENT => true,
                PDO::ATTR_AUTOCOMMIT => true,
                PDO::MYSQL_ATTR_INIT_COMMAND => "set names 'utf8'; set session sql_mode='';",
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            ]
        ]

    ]

];
