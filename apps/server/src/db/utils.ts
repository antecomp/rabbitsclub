import { createInsertSchema, createSelectSchema } from "drizzle-typebox"
import type { BuildSchema } from "drizzle-typebox"
import type { Table } from "drizzle-orm"
import { Kind, type TObject } from "@sinclair/typebox"

type Spread<
    T extends TObject | Table,
    Mode extends "select" | "insert" | undefined
> =
    T extends TObject<infer Fields>
        ? { [K in keyof Fields]: Fields[K] }
        : T extends Table
            ? Mode extends "select"
                ? BuildSchema<"select", T["_"]["columns"], undefined>["properties"]
                : Mode extends "insert"
                    ? BuildSchema<"insert", T["_"]["columns"], undefined>["properties"]
                    : {}
            : {}

export function spread<
    T extends TObject | Table,
    Mode extends "select" | "insert" | undefined
>(schema: T, mode?: Mode): Spread<T, Mode> {
    let table: TObject

    switch (mode) {
        case "insert":
        case "select":
            table = Kind in schema
                ? schema
                : mode === "insert"
                    ? createInsertSchema(schema as Table)
                    : createSelectSchema(schema as Table)
            break
        default:
            if (!(Kind in schema)) throw new Error("Expected a TypeBox schema")
            table = schema
    }

    return { ...table.properties } as Spread<T, Mode>
}

export function spreads<
    T extends Record<string, TObject | Table>,
    Mode extends "select" | "insert" | undefined
>(
    models: T,
    mode?: Mode
): { [K in keyof T]: Spread<T[K], Mode> } {
    const result = {} as { [K in keyof T]: Spread<T[K], Mode> }

    for (const key of Object.keys(models) as Array<keyof T>)
        result[key] = spread(models[key], mode)

    return result
}
