CREATE TABLE `mor_promo_codes`
(
    `promo_code` varchar(16) NOT NULL,
    `plan_id`    int(11)     NOT NULL,
    `expires`    int(11)     NOT NULL,
    `use_left`   int(11)     NOT NULL,
    PRIMARY KEY (`promo_code`),
    KEY `PLAN` (`plan_id`),
    CONSTRAINT `mor_promo_codes_ibfk_1` FOREIGN KEY (`plan_id`) REFERENCES `mor_plans` (`plan_id`)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8;
