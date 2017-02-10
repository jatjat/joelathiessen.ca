export function rotl33tStr(string) {
    return string.replace(/[A-Za-z]/g, (char) => {
      return String.fromCharCode(char.charCodeAt(0) + (char.toUpperCase() <= "M" ? 13 : -13));
    });
  }
