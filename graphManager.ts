import mysqlClient from "https://raw.githubusercontent.com/Schotsl/Uberdeno/v1.2.1/services/mysqlClient.ts";

import { restoreUUID } from "https://raw.githubusercontent.com/Schotsl/Uberdeno/v1.2.1/helper.ts";

class GraphManager {
  async getLineChart(session: string, range = 360, interval = 30) {
    const lineQuery =
      "SELECT HEX(player.uuid) AS player_uuid, player.username AS player_username, TIMESTAMP(CONVERT_TZ(entry.created, @@session.time_zone, '+00:00')) AS timestamp_utc, SUM( CASE WHEN entry.sips < 0 THEN -entry.sips ELSE 0 END + CASE WHEN entry.shots < 0 THEN -entry.shots * 10 ELSE 0 END ) AS sips_consumed, SUM( CASE WHEN entry.sips > 0 THEN entry.sips ELSE 0 END + CASE WHEN entry.shots > 0 THEN entry.shots * 10 ELSE 0 END ) AS sips_to_consume FROM entry JOIN player ON entry.player = player.uuid JOIN session ON entry.session = session.uuid WHERE session.uuid = UNHEX(REPLACE(?, '-', '')) AND entry.giveable = 0 AND entry.transfer = 0 AND entry.created >= DATE_SUB(NOW(), INTERVAL ? HOUR) GROUP BY UNIX_TIMESTAMP(entry.created) DIV (? * 60), player.uuid ORDER BY timestamp_utc, player.username";
    const lineParams = [session, range, interval];
    const lineRows = await mysqlClient.query(lineQuery, lineParams);

    lineRows.map((row: Record<string, string>) =>
      row.player = restoreUUID(row.player_uuid)
    );

    return lineRows;
  }

  async getBarChart(session: string, range = 360) {
    const lineQuery =
      "SELECT HEX(p.uuid) AS player_uuid, p.username AS player_username, COALESCE(sips_consumed, 0) AS sips_consumed, COALESCE(sips_to_consume, 0) AS sips_to_consume FROM player p LEFT JOIN ( SELECT player, SUM( CASE WHEN entry.sips < 0 THEN -entry.sips ELSE 0 END + CASE WHEN entry.shots < 0 THEN -entry.shots * 10 ELSE 0 END ) AS sips_consumed, SUM( CASE WHEN entry.sips > 0 THEN entry.sips ELSE 0 END + CASE WHEN entry.shots > 0 THEN entry.shots * 10 ELSE 0 END ) AS sips_to_consume FROM entry WHERE entry.giveable = 0 AND entry.transfer = 0 AND entry.created >= DATE_SUB(NOW(), INTERVAL 6 HOUR) GROUP BY player ) AS sip_data ON p.uuid = sip_data.player WHERE p.session = UNHEX(REPLACE(?, '-', '')) ORDER BY p.username";
    const lineParams = [session, range];
    const lineRows = await mysqlClient.query(lineQuery, lineParams);

    return lineRows;
  }
}

const graphManager = new GraphManager();

export default graphManager;
