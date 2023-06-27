-- TEMP USER table creation
-- FOR users that haven't validated there email yet
CREATE TABLE `codingracer`.`temp_users` (`userId` VARCHAR(36) NOT NULL , `username` VARCHAR(16) NOT NULL , `password` VARCHAR(60) NOT NULL , `email` VARCHAR(255) NOT NULL , PRIMARY KEY (`userId`));

-- USER table creation
CREATE TABLE `codingracer`.`users` (`userId` VARCHAR(36) NOT NULL , `username` VARCHAR(16) NOT NULL , `password` VARCHAR(60) NOT NULL , `email` VARCHAR(255) NOT NULL , PRIMARY KEY (`userId`));

-- Game etxt creation
CREATE TABLE `codingracer`.`game_text` (`id` VARCHAR(36) NOT NULL , `language` VARCHAR(16) NOT NULL , `text` TEXT NOT NULL , `difficulty` VARCHAR(12) NOT NULL , PRIMARY KEY (`id`));