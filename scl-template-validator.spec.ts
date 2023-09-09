import { expect } from "chai";
import { validate } from "./scl-template-validator.js";
import { Issue } from "./foundation.js";

describe("scl-template-validation", () => {
  it("returns empty array when SCL edition is <2007B3", async () => {
    const doc = await fetch("testfiles/Edition1.scd")
      .then((response) => response.text())
      .then((str) => new DOMParser().parseFromString(str, "application/xml"));

    const issues: Issue[] = [];
    for await (const issueGroup of validate(doc)) issues.push(...issueGroup);
    expect(issues.length).to.equal(0);
  });

  it("returns empty array when no data type templates are there to validate", async () => {
    const doc = await fetch("testfiles/missingData.scd")
      .then((response) => response.text())
      .then((str) => new DOMParser().parseFromString(str, "application/xml"));

    const issues: Issue[] = [];
    for await (const issueGroup of validate(doc)) issues.push(...issueGroup);
    expect(issues.length).to.equal(0);
  });

  it("returns Info when no data type templates are there to validate", async () => {
    const doc = await fetch("testfiles/templateIssues.scd")
      .then((response) => response.text())
      .then((str) => new DOMParser().parseFromString(str, "application/xml"));

    const issues: Issue[] = [];
    for await (const issueGroup of validate(doc)) issues.push(...issueGroup);
    expect(issues.length).to.equal(28);
  });
});
