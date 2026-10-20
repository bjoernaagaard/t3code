import { assert } from "@effect/vitest";
import type { ProviderReplayTranscript } from "@t3tools/contracts";

import type { OrchestratorV2ScenarioResult } from "../../OrchestratorScenario.ts";
import {
  assertAssistantTextIncludes,
  assertBaseProjection,
  assertExecutionNodeKinds,
  assertSemanticProjectionIntegrity,
  assertTurnItemTypes,
  assertUserMessagesInclude,
  assertVisibleTurnItemsMirrorLocalTurnItems,
  projectionFor,
  TODO_LIST_PROMPT,
} from "../shared.ts";

export function assertTodoListPiOutput(
  result: OrchestratorV2ScenarioResult,
  transcript: ProviderReplayTranscript,
) {
  assertBaseProjection({ result, transcript, runCount: 1, runStatuses: ["completed"] });

  const projection = projectionFor(result, transcript.scenario);
  assertSemanticProjectionIntegrity(projection);
  assertVisibleTurnItemsMirrorLocalTurnItems(projection);
  assertExecutionNodeKinds(projection, ["root_turn", "todo_list", "tool_call"]);
  assertTurnItemTypes(projection, ["user_message", "todo_list", "assistant_message"]);
  assertUserMessagesInclude(projection, [TODO_LIST_PROMPT]);
  assertAssistantTextIncludes(projection, "todo list fixture complete");
  assert.isFalse(
    projection.turnItems.some(
      (item) => item.type === "dynamic_tool" && item.toolName === "update_plan",
    ),
    "a tool result that declares details.t3Plan renders only as the native todo list",
  );

  // Projection plans sort by id, so read them in the order their turn items appeared.
  const todoItems = projection.turnItems.filter((item) => item.type === "todo_list");
  const todoLists = todoItems.flatMap((item) =>
    projection.plans.filter(
      (plan): plan is Extract<typeof plan, { kind: "todo_list" }> =>
        plan.kind === "todo_list" && plan.id === item.planId,
    ),
  );
  assert.isAtLeast(todoLists.length, 2, "the plan is updated as the steps complete");
  assert.isTrue(
    todoLists
      .slice(0, -1)
      .every((plan) => plan.status === "superseded" || plan.status === "completed"),
    "no earlier todo list stays active once a newer one arrives",
  );
  assert.equal(todoLists.at(-1)?.status, "completed");
  assert.deepEqual(
    todoLists.at(-1)?.steps.map((step) => step.status),
    ["completed", "completed", "completed"],
  );
}
