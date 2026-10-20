declare const __T3CODE_BUILD_DISTRIBUTION__: string | undefined;

/**
 * A build made with `T3CODE_DISTRIBUTION=<id>` gets its own bundle id, name,
 * Electron profile and state directory, so it runs beside the official app
 * without sharing a single-instance lock, keychain entry or database.
 */
export interface DesktopDistribution {
  readonly appId: string;
  readonly baseName: string;
  readonly homeDirName: string;
  readonly userDataSuffix: string;
}

const DISTRIBUTION_ID_PATTERN = /^[a-z][a-z0-9-]{0,30}$/u;

export function resolveDesktopDistribution(raw: string | undefined): DesktopDistribution {
  const id = raw?.trim().toLowerCase() ?? "";
  if (id === "") {
    return {
      appId: "com.t3tools.t3code",
      baseName: "T3 Code",
      homeDirName: ".t3",
      userDataSuffix: "",
    };
  }
  if (!DISTRIBUTION_ID_PATTERN.test(id)) {
    throw new Error(`T3CODE_DISTRIBUTION '${raw}' must match ${DISTRIBUTION_ID_PATTERN.source}.`);
  }
  return {
    appId: `com.t3tools.t3code.${id}`,
    baseName: `T3 Code ${id[0]!.toUpperCase()}${id.slice(1)}`,
    homeDirName: `.t3-${id}`,
    userDataSuffix: `-${id}`,
  };
}

export const DESKTOP_DISTRIBUTION = resolveDesktopDistribution(
  typeof __T3CODE_BUILD_DISTRIBUTION__ === "undefined" ? undefined : __T3CODE_BUILD_DISTRIBUTION__,
);
