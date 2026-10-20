import { OrchestrationV2PlanArtifact } from "@t3tools/contracts";
import * as Option from "effect/Option";
import * as Schema from "effect/Schema";
import * as Struct from "effect/Struct";

import { piRecordField as recordField } from "./rpc.ts";

const [ProposedPlan, TodoList] = OrchestrationV2PlanArtifact.members;
const APP_OWNED_FIELDS = [
  "id",
  "threadId",
  "runId",
  "nodeId",
  "status",
  "detailInTurnItem",
] as const;

/**
 * The plan a Pi tool result declares in `details.t3Plan`. It is the contract's
 * plan artifact without the fields T3 assigns, so any extension tool can show
 * a native todo list or proposed plan.
 */
export const PiT3Plan = Schema.Union([
  TodoList.mapFields(Struct.omit(APP_OWNED_FIELDS)),
  ProposedPlan.mapFields(Struct.omit(APP_OWNED_FIELDS)),
]);
export type PiT3Plan = typeof PiT3Plan.Type;

const decodePiT3Plan = Schema.decodeUnknownOption(PiT3Plan);

export function piT3Plan(result: unknown): PiT3Plan | undefined {
  return Option.getOrUndefined(
    decodePiT3Plan(recordField(recordField(result, "details"), "t3Plan")),
  );
}
