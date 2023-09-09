import { expect } from "chai";

import { lNodeTypeValidator } from "./lNodeType.js";

describe("Validator for LNodeType element", () => {
  let doc: XMLDocument;
  beforeEach(async () => {
    doc = await fetch("../testfiles/templateIssues.scd")
      .then((response) => response.text())
      .then((str) => new DOMParser().parseFromString(str, "application/xml"));
  });

  it("return Issue for missing mandatory DO e.g Beh", async () => {
    const element = doc.querySelector('LNodeType[id="Dummy.CILO"]')!;
    const errors = await lNodeTypeValidator(element);
    expect(errors.length).to.equal(1);
  });

  it("return Issues for missing mandatory DO e.g Pos", async () => {
    const element = doc.querySelector('LNodeType[id="Dummy.CSWI"]')!;
    const errors = await lNodeTypeValidator(element);
    expect(errors.length).to.equal(1);
  });

  it("returns Issues if child element is invalid", async () => {
    const element = doc.querySelector('LNodeType[id="Dummy.invalidChild"]')!;
    const errors = await lNodeTypeValidator(element);
    expect(errors.length).to.equal(1);
  });

  it("returns Issues if lnClass attribute is missing", async () => {
    const element = doc.querySelector('LNodeType[id="Dummy.CILO"]')!;
    element.removeAttribute("lnClass");
    const errors = await lNodeTypeValidator(element);
    expect(errors.length).to.equal(1);
    expect(errors[0].title).to.contain("Missing mandatory attribute");
  });

  it("returns empty array if LNodeType includes all mandatory DOs", async () => {
    const element = doc.querySelector('LNodeType[id="Dummy.GGIO1"]')!;
    const errors = await lNodeTypeValidator(element);
    expect(errors.length).to.equal(0);
  });
});
