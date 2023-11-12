import { wrapNodeInString } from "@/lib/utils";

let testStr =
  "deque([Node(ID='114c4560-cdee-4bac-9cfc-6bd8cf6e974816979603557661699758382013', value=20), Node(ID='75d5fc3d-3c91-46ff-ae13-576e2cb9d17516979603557661699758382013', value=54), Node(ID='0c4ee183-2b58-4c15-a8fd-9c716ef22b4216979603557661699758382013', value=30), Node(ID='22ad2d09-7ba7-4f52-8fd9-c305dd06b9c716979603557661699758382013', value=43)])";

console.log(wrapNodeInString(testStr));
