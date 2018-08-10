export function rotl33tStr(string: string) {
  return string.replace(/[A-Za-z]/g, (char: string) => {
    return String.fromCharCode(
      char.charCodeAt(0) + (char.toUpperCase() <= "M" ? 13 : -13)
    );
  });
}
