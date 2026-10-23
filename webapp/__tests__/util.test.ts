import { robotSessionSettingsState } from "../src/util";

// kaly2 stopped supporting resets in December 2018, so its replies no longer say hasJustReset.
// The page only draws robot updates while resetting is false, so without hasJustReset it
// would stop drawing after the first reply. No hasJustReset means no reset happened.
const state = robotSessionSettingsState({ isRunning: true });
const ok = state.resetting === false;
console.log(
  `${ok ? "PASS" : "FAIL"}: a start reply without hasJustReset leaves the page not resetting ` +
    `(resetting: ${state.resetting})`
);
if (!ok) {
  process.exit(1);
}
