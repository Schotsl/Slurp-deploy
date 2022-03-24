import { ColumnInfo } from "https://raw.githubusercontent.com/Schotsl/Uberdeno/main/types.ts";
import {
  generateColumns,
  populateInstance,
} from "https://raw.githubusercontent.com/Schotsl/Uberdeno/main/helper.ts";

import PlayerEntity from "../entity/PlayerEntity.ts";
import InterfaceMapper from "https://raw.githubusercontent.com/Schotsl/Uberdeno/main/mapper/InterfaceMapper.ts";
import PlayerCollection from "../collection/PlayerCollection.ts";

export default class GeneralMapper implements InterfaceMapper {
  private generalColumns: ColumnInfo[] = [];

  constructor() {
    this.generalColumns = generateColumns(PlayerEntity);
  }

  public mapObject(row: Record<string, never>): PlayerEntity {
    const entity = new PlayerEntity();

    populateInstance(row, this.generalColumns, entity);

    entity.taken = {
      sips: row.taken_sips,
      shots: row.taken_shots,
    };

    entity.giveable = {
      sips: row.giveable_sips,
      shots: row.giveable_shots,
    };

    entity.remaining = {
      sips: row.remaining_sips,
      shots: row.remaining_shots,
    };

    return entity;
  }

  public mapArray(
    rows: Record<string, never>[],
  ): PlayerEntity[] {
    const entries = rows.map((row) => this.mapObject(row));
    return entries;
  }

  public mapCollection(
    rows: Record<string, never>[],
    offset: number,
    limit: number,
    total: number,
  ): PlayerCollection {
    const players = this.mapArray(rows);

    return {
      total,
      limit,
      offset,
      players,
    };
  }
}
