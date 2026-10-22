export function rotl33tStr(string: string) {
  return string.replace(/[A-Za-z]/g, (char: string) => {
    return String.fromCharCode(
      char.charCodeAt(0) + (char.toUpperCase() <= "M" ? 13 : -13)
    );
  });
}

// The page's state after kaly2 replies to a start, pause or reset request
export function robotSessionSettingsState(msg: any) {
  return {
    isRunning: msg.isRunning,
    resetting: msg.hasJustReset
  };
}
