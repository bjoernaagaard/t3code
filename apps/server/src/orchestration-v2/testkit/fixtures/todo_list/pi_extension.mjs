import { Type } from "typebox";

const STATUS = { pending: "pending", in_progress: "running", completed: "completed" };

export default function (pi) {
  pi.registerTool({
    name: "update_plan",
    label: "Update plan",
    description: "Replace the task plan with these steps and their current status.",
    parameters: Type.Object({
      explanation: Type.Optional(Type.String()),
      plan: Type.Array(
        Type.Object({
          step: Type.String(),
          status: Type.Union([
            Type.Literal("pending"),
            Type.Literal("in_progress"),
            Type.Literal("completed"),
          ]),
        }),
      ),
    }),
    async execute(_toolCallId, params) {
      const steps = params.plan.map((entry, index) => ({
        id: `step-${index + 1}`,
        text: entry.step,
        status: STATUS[entry.status],
      }));
      return {
        content: [{ type: "text", text: "Plan updated" }],
        details: {
          t3Plan: {
            kind: "todo_list",
            steps,
            ...(params.explanation === undefined ? {} : { explanation: params.explanation }),
          },
        },
      };
    },
  });
}
