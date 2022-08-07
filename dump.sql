CREATE TABLE session (
	uuid BINARY(16) NOT NULL,
	short VARCHAR(255) NOT NULL,
	active TINYINT DEFAULT 1,

	created timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	updated timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

	PRIMARY KEY (uuid)
)

CREATE TABLE player (
	uuid BINARY(16) NOT NULL,

	session BINARY(16) NOT NULL,
	username VARCHAR(255) NOT NULL,

	created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	updated TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

	PRIMARY KEY (session, uuid),
	FOREIGN KEY (session) REFERENCES session(uuid) ON DELETE CASCADE
)

CREATE TABLE entry (
	uuid BINARY(16) NOT NULL,

	session BINARY(16) NOT NULL,
	player BINARY(16) NOT NULL,

	sips TINYINT DEFAULT 0,
	shots TINYINT DEFAULT 0,

	giveable TINYINT DEFAULT 0,
	transfer TINYINT DEFAULT 0,

	created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	updated TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

	PRIMARY KEY (uuid),
	FOREIGN KEY (player, session) REFERENCES player(uuid, session) ON DELETE CASCADE
)

ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_0900_ai_ci;



-- Graph query

-- SELECT
-- 	TIMESTAMP(CONCAT(YEAR(entry.created), '-', MONTH(entry.created), '-' , DAYOFMONTH(entry.created), ' ', HOUR(entry.created), ':', (FLOOR(MINUTE(entry.created) / 15) * 15), ':00')) AS timestamp,
-- 	player.uuid,
-- 	player.username,
-- 	SUM(entry.sips) AS sips,
-- 	SUM(entry.shots) AS shots
-- FROM
-- 	entry
-- INNER JOIN
-- 	player ON
-- 	(player.uuid,
-- 	player.session) = (entry.player,
-- 	entry.session)
-- WHERE
-- 	player.session = UNHEX(REPLACE('b2955a40-4018-447d-a6b2-e42b2930eb35',
-- 	'-',
-- 	''))
-- 	AND entry.giveable = 0
-- 	AND entry.transfer = 0
-- 	AND entry.created >= DATE_SUB(NOW(), INTERVAL 12 HOUR)
-- 	AND (entry.sips < 0
-- 		OR entry.shots < 0)
-- GROUP BY
-- 	timestamp,
-- 	entry.player;



-- Already taken summary

-- SELECT
-- 	player.uuid,
-- 	player.username,
-- 	SUM(entry.sips) AS sips,
-- 	SUM(entry.shots) AS shots
-- FROM
-- 	entry
-- INNER JOIN
-- 	player ON
-- 	(player.uuid,
-- 	player.session) = (entry.player,
-- 	entry.session)
-- WHERE
-- 	player.session = UNHEX(REPLACE('b2955a40-4018-447d-a6b2-e42b2930eb35',
-- 	'-',
-- 	''))
-- 	AND entry.giveable = 0
-- 	AND entry.transfer = 0
-- 	AND (entry.sips < 0
-- 		OR entry.shots < 0)
-- GROUP BY
-- 	entry.player



-- Too be taken summary

-- SELECT
-- 	player.uuid,
-- 	player.username,
-- 	SUM(entry.sips) AS sips,
-- 	SUM(entry.shots) AS shots
-- FROM
-- 	entry
-- INNER JOIN
-- 	player ON
-- 	(player.uuid,
-- 	player.session) = (entry.player,
-- 	entry.session)
-- WHERE
-- 	player.session = UNHEX(REPLACE('b2955a40-4018-447d-a6b2-e42b2930eb35',
-- 	'-',
-- 	''))
-- 	AND entry.giveable = 0
-- 	AND (entry.sips > 0
-- 		OR entry.shots > 0)
-- GROUP BY
-- 	entry.player