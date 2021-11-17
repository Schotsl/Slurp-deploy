import { restoreUUID } from "https://raw.githubusercontent.com/Schotsl/Uberdeno/main/helper.ts";

import GraphEntity from "../entity/GraphEntity.ts";
import GraphCollection from "../collection/GraphCollection.ts";
import InterfaceMapper from "https://raw.githubusercontent.com/Schotsl/Uberdeno/main/mapper/InterfaceMapper.ts";

export default class GraphMapper implements InterfaceMapper {
  public mapObject(row: Record<string, never>): GraphEntity {
    const uuid = restoreUUID(row.uuid);
    const entry = new GraphEntity(uuid);

    entry.server = restoreUUID(row.server);

    return entry;
  }

  public mapArray(
    rows: Record<string, never>[],
  ): GraphEntity[] {
    // TODO: This function could probably be rewritten

    const graphs: GraphEntity[] = [];

    rows.forEach((row) => {
      let graph = graphs.find((graph) => graph.uuid === restoreUUID(row.uuid));

      if (typeof graph === "undefined") {
        graph = this.mapObject(row);
        graphs.push(graph);
      }

      const hour = row.hour;
      const taken = {
        sips: parseInt(row.sips_taken), 
        shots: parseInt(row.shots_taken)
      };
      
      const remaining = {
        sips: parseInt(row.sips_remaining),
        shots: parseInt(row.shots_remaining),
      };

      graph.timeline.push({ hour, taken, remaining });
    });

    return graphs;
  }

  public mapCollection(
    rows: Record<string, never>[],
    offset: number,
    limit: number,
    total: number,
  ): GraphCollection {
    const players = this.mapArray(rows);

    return {
      total,
      limit,
      offset,
      players,
    };
  }
}
