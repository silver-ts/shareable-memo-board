import { inlineElementParserList } from ".";
import { marked } from "..";

export const DONE_LIST_REG = /^- \[x\] ([\S ]+)(\n?)/;

const match = (rawStr: string): number => {
  const matchResult = rawStr.match(DONE_LIST_REG);
  if (!matchResult) {
    return 0;
  }

  const matchStr = matchResult[0];
  return matchStr.length;
};

const renderer = (rawStr: string): string => {
  const matchResult = rawStr.match(DONE_LIST_REG);
  if (!matchResult) {
    return rawStr;
  }

  const parsedContent = marked(matchResult[1], inlineElementParserList);
  return `<p><span class='todo-block done' data-value='DONE'>✓</span>${parsedContent}</p>${matchResult[2]}`;
};

export default {
  name: "done list",
  regex: DONE_LIST_REG,
  match,
  renderer,
};
