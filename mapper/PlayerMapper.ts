import { ColumnInfo } from "https://raw.githubusercontent.com/Schotsl/Uberdeno/main/types.ts";
import { generateColumns, populateInstance } from "https://raw.githubusercontent.com/Schotsl/Uberdeno/main/helper.ts";

import PlayerEntity from "../entity/PlayerEntity.ts";
import PlayerCollection from "../collection/PlayerCollection.ts";

import InterfaceMapper from "https://raw.githubusercontent.com/Schotsl/Uberdeno/main/mapper/InterfaceMapper.ts";

export default class GeneralMapper implements InterfaceMapper {
  private Entity: { new (): PlayerEntity };

  private generalColumns: ColumnInfo[] = [];

  constructor(
    Entity: { new (): PlayerEntity },
  ) {
    this.Entity = Entity;

    this.generalColumns = generateColumns(Entity);
  }

  public mapObject(row: Record<string, never>): PlayerEntity {
    const entity = new this.Entity();

    // Transform strings and numbers into the column wrappers
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
    // Map the rows into an array of entities
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
