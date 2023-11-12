import { parseNodeRepr } from "@/lib/utils";
import assert from "assert";

let id = "22ad2d09-7ba7-4f52-8fd9-c305dd06b9c716979603557661699757050353";
let value = 43;
const res = parseNodeRepr(`Node(ID='${id}', value=${value})`);

assert(res.id == id);
assert(res.value == value);

console.log("All tests passed");
