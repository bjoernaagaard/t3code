import { resolveDesktopDistribution } from "@t3tools/shared/desktopDistribution";

declare const __T3CODE_BUILD_DISTRIBUTION__: string | undefined;

export const DESKTOP_DISTRIBUTION = resolveDesktopDistribution(
  typeof __T3CODE_BUILD_DISTRIBUTION__ === "undefined" ? undefined : __T3CODE_BUILD_DISTRIBUTION__,
);
