import { runAll, runScenario, runControl, mountForProbe, unmountProbe } from "./harness/run";
import { scenarios } from "./harness/registry";
import { sampleSpec } from "./harness/metrics";

// The PREBUILT library stylesheet. Not the Tailwind sources: the whole premise
// is that Vue can reuse @finchtoys/ui's dist/style.css untouched.
import "@css";

declare global {
  interface Window {
    __finchVueSpike: {
      ready: boolean;
      scenarios: { id: string; group: string; title: string; treeId?: string }[];
      runAll: typeof runAll;
      runScenario: typeof runScenario;
      runControl: typeof runControl;
      mountForProbe: typeof mountForProbe;
      unmountProbe: typeof unmountProbe;
      sample: typeof sampleSpec;
    };
  }
}

window.__finchVueSpike = {
  ready: true,
  scenarios: scenarios.map(({ id, group, title, treeId }) => ({ id, group, title, treeId })),
  runAll,
  runScenario,
  runControl,
  mountForProbe,
  unmountProbe,
  sample: sampleSpec,
};

document.body.dataset.harnessReady = "true";
