import { Type } from "typebox";

export default function (pi) {
  pi.registerTool({
    name: "propose_plan",
    label: "Propose plan",
    description:
      "Present a final plan to the user as a proposed plan block. Pass the complete plan as Markdown. Use this instead of writing the plan in your reply.",
    parameters: Type.Object({ plan: Type.String() }),
    async execute(_toolCallId, params) {
      return {
        content: [{ type: "text", text: "Plan presented to the user" }],
        details: { t3Plan: { kind: "proposed_plan", markdown: params.plan } },
      };
    },
  });
}
