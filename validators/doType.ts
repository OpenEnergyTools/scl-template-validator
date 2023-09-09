import {
  Issue,
  getAdjacentClass,
  iec6185073,
  iec6185074,
  iec6185081,
  validateChildren,
} from "../foundation.js";

async function getSpecificDataObject(
  lnClass: string | null | undefined,
  doName: string | null | undefined
): Promise<Element | null> {
  if (!lnClass || !doName) return null;

  const lNodeClasses = getAdjacentClass(await iec6185074, lnClass!);

  return (
    lNodeClasses
      .flatMap((lNodeClass) =>
        Array.from(lNodeClass.querySelectorAll(`DataObject`))
      )
      .find((dataObject) => dataObject.getAttribute("name") === doName) ?? null
  );
}

async function getNsdReference(element: Element): Promise<Element | null> {
  const id = element.getAttribute("id");

  if (!id) return null;

  const doOrSdo = element
    .closest("DataTypeTemplates")
    ?.querySelector(
      `LNodeType > DO[type="${id}"], LNodeType > SDO[type="${id}"]`
    );
  const doName = doOrSdo?.getAttribute("name");

  const lNodeType = doOrSdo?.parentElement;
  const lnClass = lNodeType?.getAttribute("lnClass");

  return getSpecificDataObject(lnClass, doName);
}

function getControlServicePresConditions(
  ctlModel: string | null | undefined
): string[] {
  if (!ctlModel || ctlModel === "status-only") return [];

  if (ctlModel.includes("direct")) return ["MOctrl"];

  if (ctlModel.includes("normal")) return ["MOctrl", "MOsbo", "MOsboNormal"];

  if (ctlModel.includes("enhanced"))
    return ["MOctrl", "MOsbo", "MOsboEnhanced"];

  return [];
}

async function getMandatoryDataAttribute(
  doType: Element,
  cdc: string
): Promise<Element[]> {
  const nsd73 = await iec6185073;
  const nsd81 = await iec6185081;

  const dataAttributes = Array.from(
    nsd73.querySelectorAll(`CDC[name="${cdc}"] > DataAttribute[presCond="M"]`)
  );

  const servicePresConds = getControlServicePresConditions(
    doType.querySelector('DA[name="ctlModel"] > Val')?.textContent?.trim()
  );
  const serviceDataAttribute = Array.from(
    nsd81.querySelectorAll(`ServiceCDC[cdc="${cdc}"] > ServiceDataAttribute`)
  ).filter((da) => servicePresConds.includes(da.getAttribute("presCond")!));

  return dataAttributes.concat(serviceDataAttribute);
}

async function validateAttributes(
  doType: Element,
  cdc: string
): Promise<Issue[]> {
  const reference = await getNsdReference(doType);

  if (reference && cdc !== reference.getAttribute("type"))
    return [
      {
        title: `Incorrect common data class. Expected is ${reference}`,
        message: `${doType.getAttribute("id")}(${cdc})`,
      },
    ];

  return [];
}

async function missingMandatoryChildren(
  dotype: Element,
  cdc: string
): Promise<Issue[]> {
  const errors: Issue[] = [];

  const mandatoryDAs = (await getMandatoryDataAttribute(dotype, cdc)).map(
    (DA) => DA.getAttribute("name")!
  );

  mandatoryDAs.forEach((mandatoryDa) => {
    if (!dotype.querySelector(`DA[name="${mandatoryDa}"]`))
      errors.push({
        title: `Missing mandatory data attribute ${mandatoryDa}`,
        message: `${dotype.getAttribute("id")}(${cdc})`,
      });
  });

  return errors;
}

export async function dOTypeValidator(doType: Element): Promise<Issue[]> {
  const errors: Issue[] = [];

  if (doType.tagName !== "DOType") return [];

  const cdc = doType.getAttribute("cdc");
  if (!cdc)
    return [
      {
        title: `Missing mandatory attribute cdc`,
        message: `${doType.getAttribute("id")}`,
      },
    ];

  const incorrectAttributes = await validateAttributes(doType, cdc);
  const missingChildren = await missingMandatoryChildren(doType, cdc);
  const issuesChildren = await validateChildren(doType);

  return errors.concat(missingChildren, issuesChildren, incorrectAttributes);
}
