import type { JSONContent } from "@tiptap/core";

interface PatternEntry {
  regex: RegExp;
  build: (m: RegExpExecArray) => JSONContent;
}

const INLINE_PATTERNS: PatternEntry[] = [
  {
    build: (m) => ({ attrs: { alt: m[1], src: m[2] }, type: "image" }),
    regex: /!\[([^\]]*)\]\(([^)]+)\)/g,
  },
  {
    build: (m) => ({
      marks: [{ attrs: { href: m[2] }, type: "link" }],
      text: m[1],
      type: "text",
    }),
    regex: /\[([^\]]+)\]\(([^)]+)\)/g,
  },
  {
    build: (m) => ({
      marks: [{ type: "bold" }],
      text: m[1],
      type: "text",
    }),
    regex: /\*\*(.+?)\*\*/g,
  },
  {
    build: (m) => ({
      marks: [{ type: "strike" }],
      text: m[1],
      type: "text",
    }),
    regex: /~~(.+?)~~/g,
  },
  {
    build: (m) => ({
      marks: [{ type: "italic" }],
      text: m[1],
      type: "text",
    }),
    regex: /\*(.+?)\*/g,
  },
  {
    build: (m) => ({
      marks: [{ type: "code" }],
      text: m[1],
      type: "text",
    }),
    regex: /`(.+?)`/g,
  },
  {
    build: (m) => ({
      marks: [{ type: "highlight" }],
      text: m[1],
      type: "text",
    }),
    regex: /[=]{2}(.+?)[=]{2}/g,
  },
];

const parseInline = (text: string): JSONContent[] => {
  if (!text) {
    return [];
  }

  interface MatchEntry {
    index: number;
    text: string;
    node: JSONContent;
  }
  const allMatches: MatchEntry[] = [];

  for (const { regex, build } of INLINE_PATTERNS) {
    regex.lastIndex = 0;
    let match: RegExpExecArray | null;
    while ((match = regex.exec(text)) !== null) {
      allMatches.push({ index: match.index, node: build(match), text: match[0] });
    }
  }

  allMatches.sort((a, b) => a.index - b.index);

  const nodes: JSONContent[] = [];
  let lastIndex = 0;

  for (const m of allMatches) {
    if (m.index < lastIndex) {
      continue;
    }
    if (m.index > lastIndex) {
      nodes.push({ text: text.slice(lastIndex, m.index), type: "text" });
    }
    nodes.push(m.node);
    lastIndex = m.index + m.text.length;
  }

  if (lastIndex < text.length) {
    nodes.push({ text: text.slice(lastIndex), type: "text" });
  }

  return nodes.length > 0 ? nodes : [{ text, type: "text" }];
};

const pushParagraph = (content: JSONContent[], inlineText: string) => {
  const inlineNodes = parseInline(inlineText);
  if (inlineNodes.length > 0) {
    content.push({ content: inlineNodes, type: "paragraph" });
  }
};

type CollectFn = (content: JSONContent[], lines: string[], i: number) => number;

const collectHeading: CollectFn = (content, lines, i) => {
  const match = lines[i].match(/^(#{1,6})\s+(.+)/);
  if (!match) {
    return i;
  }
  content.push({
    attrs: { level: match[1].length },
    content: parseInline(match[2].trim()),
    type: "heading",
  });
  return i + 1;
};

const collectCodeBlock: CollectFn = (content, lines, i) => {
  if (!lines[i].trim().startsWith("```")) {
    return i;
  }
  const lang = lines[i].trim().slice(3).trim() || "plaintext";
  const codeLines: string[] = [];
  let j = i + 1;
  while (j < lines.length && !lines[j].trim().startsWith("```")) {
    codeLines.push(lines[j]);
    j += 1;
  }
  content.push({
    attrs: { language: lang },
    content: codeLines.map((l) => ({ text: `${l}\n`, type: "text" })),
    type: "codeBlock",
  });
  // skip past closing ```
  return j + 1;
};

const collectBlockquote: CollectFn = (content, lines, i) => {
  if (!lines[i].startsWith("> ")) {
    return i;
  }
  const quoteLines: string[] = [];
  let j = i;
  while (j < lines.length && lines[j].startsWith("> ")) {
    quoteLines.push(lines[j].slice(2));
    j += 1;
  }
  const quoteContent: JSONContent[] = [];
  for (const ql of quoteLines) {
    quoteContent.push({ content: parseInline(ql), type: "paragraph" });
  }
  content.push({ content: quoteContent, type: "blockquote" });
  return j;
};

const collectTaskList: CollectFn = (content, lines, i) => {
  const re = /^-\s+\[([ xX])\]\s+(.+)/;
  if (!re.test(lines[i])) {
    return i;
  }
  const taskItems: JSONContent[] = [];
  let j = i;
  while (j < lines.length) {
    const taskMatch = lines[j].match(re);
    if (!taskMatch) {
      break;
    }
    taskItems.push({
      attrs: { checked: taskMatch[1].toLowerCase() === "x" },
      content: [{ content: parseInline(taskMatch[2].trim()), type: "paragraph" }],
      type: "taskItem",
    });
    j += 1;
  }
  content.push({ content: taskItems, type: "taskList" });
  return j;
};

const collectBulletList: CollectFn = (content, lines, i) => {
  const listRe = /^-\s+(.+)/;
  if (!listRe.test(lines[i]) || /^-\s+\[/.test(lines[i])) {
    return i;
  }
  const listItems: JSONContent[] = [];
  let j = i;
  while (j < lines.length) {
    const listMatch = lines[j].match(listRe);
    if (!listMatch || /^-\s+\[/.test(lines[j])) {
      break;
    }
    listItems.push({
      content: [{ content: parseInline(listMatch[1].trim()), type: "paragraph" }],
      type: "listItem",
    });
    j += 1;
  }
  content.push({ content: listItems, type: "bulletList" });
  return j;
};

const collectOrderedList: CollectFn = (content, lines, i) => {
  const re = /^\d+\.\s+(.+)/;
  if (!re.test(lines[i])) {
    return i;
  }
  const listItems: JSONContent[] = [];
  let j = i;
  while (j < lines.length) {
    const orderedMatch = lines[j].match(re);
    if (!orderedMatch) {
      break;
    }
    listItems.push({
      content: [{ content: parseInline(orderedMatch[1].trim()), type: "paragraph" }],
      type: "listItem",
    });
    j += 1;
  }
  content.push({ content: listItems, type: "orderedList" });
  return j;
};

const collectHr: CollectFn = (content, _lines, i) => {
  content.push({ type: "horizontalRule" });
  return i + 1;
};

const collectImage: CollectFn = (content, lines, i) => {
  const match = lines[i].trim().match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
  if (!match) {
    return i;
  }
  content.push({
    content: [{ attrs: { alt: match[1], src: match[2] }, type: "image" }],
    type: "paragraph",
  });
  return i + 1;
};

// --- must be checked before heading (#)
const BLOCK_COLLECTORS: CollectFn[] = [
  collectHr,
  collectHeading,
  collectCodeBlock,
  collectBlockquote,
  collectTaskList,
  collectBulletList,
  collectOrderedList,
  collectImage,
];

const isHr = (line: string) => /^-{3,}$/.test(line.trim());

const isEmpty = (line: string) => line.trim() === "";

export const markdownToTiptap = (markdown: string): JSONContent => {
  const lines = markdown.split("\n");
  const content: JSONContent[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (isEmpty(line)) {
      i += 1;
      continue;
    }

    if (isHr(line)) {
      i = collectHr(content, lines, i);
      continue;
    }

    let handled = false;
    for (const collector of BLOCK_COLLECTORS) {
      const next = collector(content, lines, i);
      if (next !== i) {
        i = next;
        handled = true;
        break;
      }
    }

    if (!handled) {
      pushParagraph(content, line);
      i += 1;
    }
  }

  return { content, type: "doc" };
};
