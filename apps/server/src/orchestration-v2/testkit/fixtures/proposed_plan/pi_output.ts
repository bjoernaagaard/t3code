import { assert } from "@effect/vitest";
import type { ProviderReplayTranscript } from "@t3tools/contracts";

import type { OrchestratorV2ScenarioResult } from "../../OrchestratorScenario.ts";
import {
  assertBaseProjection,
  assertExecutionNodeKinds,
  assertSemanticProjectionIntegrity,
  assertTurnItemTypes,
  assertUserMessagesInclude,
  assertVisibleTurnItemsMirrorLocalTurnItems,
  projectionFor,
  PROPOSED_PLAN_PROMPT,
} from "../shared.ts";

export function assertProposedPlanPiOutput(
  result: OrchestratorV2ScenarioResult,
  transcript: ProviderReplayTranscript,
) {
  assertBaseProjection({ result, transcript, runCount: 1, runStatuses: ["completed"] });

  const projection = projectionFor(result, transcript.scenario);
  assertSemanticProjectionIntegrity(projection);
  assertVisibleTurnItemsMirrorLocalTurnItems(projection);
  assertExecutionNodeKinds(projection, ["root_turn", "plan"]);
  assertTurnItemTypes(projection, ["user_message", "proposed_plan"]);
  assertUserMessagesInclude(projection, [PROPOSED_PLAN_PROMPT]);
  assert.isFalse(
    projection.turnItems.some(
      (item) => item.type === "dynamic_tool" && item.toolName === "propose_plan",
    ),
    "a tool result that declares details.t3Plan renders only as the native proposed plan",
  );

  const proposedPlans = projection.plans.filter((plan) => plan.kind === "proposed_plan");
  assert.lengthOf(proposedPlans, 1);
  assert.equal(proposedPlans[0]?.status, "active");
  assert.match(proposedPlans[0]?.markdown ?? "", /replay/iu);
  assert.match(proposedPlans[0]?.markdown ?? "", /fixture/iu);

  const proposedPlanItems = projection.turnItems.filter((item) => item.type === "proposed_plan");
  assert.lengthOf(proposedPlanItems, 1);
  assert.equal(proposedPlanItems[0]?.planId, proposedPlans[0]?.id);
  assert.equal(proposedPlanItems[0]?.markdown, proposedPlans[0]?.markdown);
  assert.equal(proposedPlanItems[0]?.streaming, false);
}
