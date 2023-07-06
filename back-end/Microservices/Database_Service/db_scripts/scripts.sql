-- TEMP USER table creation
-- FOR users that haven't validated there email yet
CREATE TABLE `codingracer`.`temp_users` (`userId` VARCHAR(36) NOT NULL , `username` VARCHAR(16) NOT NULL , `password` VARCHAR(60) NOT NULL , `email` VARCHAR(255) NOT NULL , PRIMARY KEY (`userId`));

-- USER table creation
CREATE TABLE `codingracer`.`users` (`userId` VARCHAR(36) NOT NULL , `username` VARCHAR(16) NOT NULL , `password` VARCHAR(60) NOT NULL , `email` VARCHAR(255) NOT NULL , PRIMARY KEY (`userId`));

-- Game etxt creation
CREATE TABLE `codingracer`.`game_text` (`id` VARCHAR(36) NOT NULL , `language` VARCHAR(16) NOT NULL , `text` TEXT NOT NULL , `difficulty` VARCHAR(12) NOT NULL , PRIMARY KEY (`id`));

@@ -6,4 +6,21 @@ CREATE TABLE `codingracer`.`temp_users` (`userId` VARCHAR(36) NOT NULL , `userna
CREATE TABLE `codingracer`.`users` (`userId` VARCHAR(36) NOT NULL , `username` VARCHAR(16) NOT NULL , `password` VARCHAR(60) NOT NULL , `email` VARCHAR(255) NOT NULL , PRIMARY KEY (`userId`));

-- Game etxt creation
CREATE TABLE `codingracer`.`game_text` (`id` VARCHAR(36) NOT NULL , `language` VARCHAR(16) NOT NULL , `text` TEXT NOT NULL , `difficulty` VARCHAR(12) NOT NULL , PRIMARY KEY (`id`));
CREATE TABLE `codingracer`.`game_text` (`id` VARCHAR(36) NOT NULL , `language` VARCHAR(16) NOT NULL , `text` TEXT NOT NULL , `difficulty` VARCHAR(12) NOT NULL , PRIMARY KEY (`id`));

INSERT INTO `game_text` (`id`, `language`, `text`, `difficulty`) VALUES ('92e506e4-153a-11ee-87bc-244bfeba8c24', '', '', '')

INSERT INTO `game_text` (`id`, `language`, `text`, `difficulty`) VALUES ('38661763-153b-11ee-87bc-244bfeba8c24', 'JAVASCRIPT', '<main>\r\n <button id=\"singlePlayer-button\">Singleplayer</button>\r\n <button id=\"multiPlayer-button\">Multiplayer</button>\r\n </main>\r\n', 'BEGINNER');


INSERT INTO `game_text` (`id`, `language`, `text`, `difficulty`) VALUES ('bd109aca-154f-11ee-87bc-244bfeba8c24', 'C', '#include <stdio.h>\r\n\r\nint main() {\r\n int n, f = 1;\r\n printf(\"Enter a positive integer: \");\r\n scanf(\"%d\", &n);\r\n for (int i = 1; i <= n; i++) f *= i;\r\n printf(\"The factorial of %d is %d\\n\", n, f);\r\n return 0;\r\n}\r\n', 'BEGINNER');

INSERT INTO `game_text` (`id`, `language`, `text`, `difficulty`) VALUES ('390ceb4b-1550-11ee-87bc-244bfeba8c24', 'C', '#include <stdio.h>\r\n#include <stdlib.h>\r\n\r\ntypedef struct Node {\r\n int data;\r\n struct Node* next;\r\n} Node;\r\n\r\nvoid insert(Node** head, int data) {\r\n Node* newNode = malloc(sizeof(Node));\r\n newNode->data = data;\r\n newNode->next = *head;\r\n *head = newNode;\r\n}\r\n\r\nvoid display(Node* head) {\r\n while (head) {\r\n printf(\"%d \", head->data);\r\n head = head->next;\r\n }\r\n printf(\"\\n\");\r\n}\r\n\r\nint main() {\r\n Node* head = NULL;\r\n\r\n insert(&head, 30);\r\n insert(&head, 20);\r\n insert(&head, 10);\r\n\r\n display(head);\r\n\r\n return 0;\r\n}\r\n', 'INTERMEDIATE');

INSERT INTO `game_text` (`id`, `language`, `text`, `difficulty`) VALUES ('d63b86cc-1550-11ee-87bc-244bfeba8c24', 'C', '#include <stdio.h>\r\n\r\nvoid processArray(int arr[], int size) {\r\n int freq[100] = {0};\r\n int maxFreq = 0;\r\n\r\n for (int i = 0; i < size; i++) {\r\n freq[arr[i]]++;\r\n maxFreq = (freq[arr[i]] > maxFreq) ? freq[arr[i]] : maxFreq;\r\n }\r\n\r\n printf(\"Most frequent elements: \");\r\n for (int i = 0; i < size; i++) {\r\n if (freq[arr[i]] == maxFreq) {\r\n printf(\"%d \", arr[i]);\r\n freq[arr[i]] = 0;\r\n }\r\n }\r\n printf(\"\\n\");\r\n}\r\n\r\nint main() {\r\n int arr[] = {3, 2, 4, 2, 3, 1, 2, 2, 3};\r\n int size = sizeof(arr) / sizeof(arr[0]);\r\n\r\n processArray(arr, size);\r\n\r\n return 0;\r\n}\r\n', 'EXPERT');

INSERT INTO `game_text` (`id`, `language`, `text`, `difficulty`) VALUES ('6f34eea2-1552-11ee-87bc-244bfeba8c24', 'P5JS', 'function setup() {\r\n createCanvas(400, 100);\r\n}\r\n\r\nfunction draw() {\r\n background(220);\r\n\r\n let startX = 50; \r\n let y = height / 2; \r\n let spacing = 80; \r\n \r\n for (let i = 0; i < 5; i++) {\r\n let x = startX + i * spacing;\r\n ellipse(x, y, 50, 50);\r\n }\r\n}\r\n', 'INTERMEDIATE');

INSERT INTO `game_text` (`id`, `language`, `text`, `difficulty`) VALUES ('393a1237-1553-11ee-87bc-244bfeba8c24', 'P5JS', 'beginShape();\r\n let xoff = 0;\r\n\r\n for (let x = 0; x <= width; x += 10) {\r\n\r\n let wavey = getNoiseValue(x, yoff, timer / 10, \"w\", height / 2.4, height / 2, width / 4);\r\n\r\n vertex(x, wavey/2 - height / 7);\r\n\r\n xoff += 0.05;\r\n }\r\n \r\n yoff += 0.001; \r\n vertex(width, height);\r\n vertex(0, height-50);\r\n endShape(CLOSE);', 'ADVANCED');

INSERT INTO `game_text` (`id`, `language`, `text`, `difficulty`) VALUES ('c01dc571-1553-11ee-87bc-244bfeba8c24', 'P5JS', 'let particles = [];\r\n\r\nfunction setup() {\r\n createCanvas(400, 400);\r\n for (let i = 0; i < 100; i++) {\r\n particles.push(new Particle(random(width), random(height)));\r\n }\r\n}\r\n\r\nfunction draw() {\r\n background(220);\r\n \r\n for (let particle of particles) {\r\n particle.update();\r\n particle.display();\r\n }\r\n}\r\n\r\nclass Particle {\r\n constructor(x, y) {\r\n this.position = createVector(x, y);\r\n this.velocity = createVector(random(-1, 1), random(-1, 1));\r\n this.acceleration = createVector(0, 0.05);\r\n this.size = 10;\r\n this.color = color(random(255), random(255), random(255));\r\n }\r\n\r\n update() {\r\n this.velocity.add(this.acceleration);\r\n this.position.add(this.velocity);\r\n }\r\n\r\n display() {\r\n fill(this.color);\r\n ellipse(this.position.x, this.position.y, this.size, this.[...]