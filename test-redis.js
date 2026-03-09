const { JSON } = global;
const str = JSON.stringify(undefined);
console.log(str === undefined ? "is undefined" : str);
try {
  JSON.parse(str);
} catch (e) {
  console.log("Error parsing");
}
