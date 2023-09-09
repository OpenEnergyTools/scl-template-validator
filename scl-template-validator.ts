import { Issue, tagValidator } from "./foundation.js";

export async function* validate(
  doc: XMLDocument
): AsyncGenerator<Issue[], void, void> {
  const [version, revision, release] = [
    doc.documentElement.getAttribute("version") ?? "",
    doc.documentElement.getAttribute("revision") ?? "",
    doc.documentElement.getAttribute("release") ?? "",
  ];

  if (!(version === "2007" && revision === "B" && Number(release) > 3)) {
    yield [];
    return;
  }

  const data = doc.querySelector("DataTypeTemplates");
  if (!data) {
    yield [];
    return;
  }

  const children = Array.from(data.children);

  for (const child of children) {
    const validator = tagValidator[child.tagName];
    if (!validator) continue;

    const childIssues = validator(child);

    yield childIssues;
  }
}
