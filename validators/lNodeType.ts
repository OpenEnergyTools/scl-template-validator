/* eslint-disable no-promise-executor-return */

import {
  Issue,
  getAdjacentClass,
  iec6185074,
  validateChildren,
} from "../foundation.js";

async function getMandatoryDataObject(base: string): Promise<Element[]> {
  const lnodeclasses = getAdjacentClass(await iec6185074, base);

  return lnodeclasses.flatMap((lnodeclass) =>
    Array.from(lnodeclass.querySelectorAll('DataObject[presCond="M"]'))
  );
}

async function missingMandatoryChildren(
  lNodeType: Element,
  lnClass: string
): Promise<Issue[]> {
  const errors: Issue[] = [];

  const mandatoryDOs = await (
    await getMandatoryDataObject(lnClass)
  ).map((DO) => DO.getAttribute("name")!);

  mandatoryDOs.forEach((mandatoryDO) => {
    if (!lNodeType.querySelector(`DO[name="${mandatoryDO}"]`))
      errors.push({
        title: `The mandatory data object ${mandatoryDO} is missing`,
        message: `${lNodeType.getAttribute("id")}(${lnClass}) > ${mandatoryDO}`,
      });
  });

  return errors;
}

export async function lNodeTypeValidator(element: Element): Promise<Issue[]> {
  const errors: Issue[] = [];

  const lnClass = element.getAttribute("lnClass");
  if (!lnClass)
    return [
      {
        title: `Missing mandatory attribute lnClass`,
        message: `${element.getAttribute("id")}(${lnClass})`,
      },
    ];

  const missingChildren = await missingMandatoryChildren(element, lnClass);
  const issuesChildren = await validateChildren(element);

  return errors.concat(missingChildren, issuesChildren);
}
