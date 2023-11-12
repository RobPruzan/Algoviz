import { parseDictOrSet, parseNodeRepr } from "@/lib/utils";

const setString =
  "{Node(ID='MwaC8MyhUP5Rx2VmHCznz', value=44), Node(ID='ZlaZ2_UzfdGkGrz_OK4uA', value=30), Node(ID='3DebMGo1pVOdjviMGbov8', value=6)}";
const dictString =
  "{Node(ID='MwaC8MyhUP5Rx2VmHCznz', value=44): [Node(ID='ZlaZ2_UzfdGkGrz_OK4uA', value=30), Node(ID='3DebMGo1pVOdjviMGbov8', value=6)], Node(ID='3DebMGo1pVOdjviMGbov8', value=6): [Node(ID='MwaC8MyhUP5Rx2VmHCznz', value=44), Node(ID='ZlaZ2_UzfdGkGrz_OK4uA', value=30)], Node(ID='ZlaZ2_UzfdGkGrz_OK4uA', value=30): [Node(ID='MwaC8MyhUP5Rx2VmHCznz', value=44), Node(ID='3DebMGo1pVOdjviMGbov8', value=6)]}";

console.log(parseDictOrSet(setString, parseNodeRepr));
console.log(parseDictOrSet(dictString, parseNodeRepr));
