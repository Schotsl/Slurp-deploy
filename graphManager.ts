import mysqlClient from "https://raw.githubusercontent.com/Schotsl/Uberdeno/v1.2.1/services/mysqlClient.ts";

import { restoreUUID } from "https://raw.githubusercontent.com/Schotsl/Uberdeno/v1.2.1/helper.ts";

class GraphManager {
  async getLineChart(session: string, interval = 30, range = 360) {
    const lineQuery = "SELECT HEX(player.uuid) AS player, TIMESTAMP(CONVERT_TZ(entry.created, @@session.time_zone, '+00:00')) AS timestamp, SUM(CASE WHEN entry.sips < 0 THEN -entry.sips ELSE 0 END + CASE WHEN entry.shots < 0 THEN -entry.shots * 10 ELSE 0 END) AS sips_consumed FROM entry JOIN player ON entry.player = player.uuid JOIN session ON entry.session = session.uuid WHERE session.uuid = UNHEX(REPLACE(?, '-', '')) AND entry.giveable = 0 AND entry.transfer = 0 AND entry.created >= DATE_SUB(NOW(), INTERVAL ? HOUR) GROUP BY UNIX_TIMESTAMP(entry.created) DIV (? * 60) HAVING sips_consumed > 0 ORDER BY timestamp";
    const lineParams = [session, range, interval];
    const lineRows = await mysqlClient.query(lineQuery, lineParams);

    lineRows.map((row: Record<string, string>) =>
      row.player = restoreUUID(row.player)
    );

    return lineRows;
  }
}

const graphManager = new GraphManager();

export default graphManager;
