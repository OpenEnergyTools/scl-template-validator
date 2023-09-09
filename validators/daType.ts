import {
  Issue,
  iec6185073,
  iec6185081,
  validateChildren,
} from "../foundation.js";

async function getChildren(
  cdc: string | null | undefined,
  daName: string | null | undefined
): Promise<Element[]> {
  const nsd73 = await iec6185073;

  const dataAttribute = nsd73
    .querySelector(`CDC[name="${cdc}"] > DataAttribute[name="${daName}"]`)
    ?.getAttribute("type");

  return Array.from(
    nsd73.querySelectorAll(
      `ConstructedAttributes > ConstructedAttribute[name="${dataAttribute}"] > SubDataAttribute[presCond="M"]`
    )
  );
}

async function getServiceChildren(
  daName: string | null | undefined
): Promise<Element[]> {
  const nsd81 = await iec6185081;

  return Array.from(
    nsd81.querySelectorAll(
      `ServiceConstructedAttributes > ServiceConstructedAttribute[name="${daName}"] > ` +
        ` SubDataAttribute[presCond="M"]`
    )
  );
}

async function getMandatoryChildren(daType: Element): Promise<Element[]> {
  const id = daType.getAttribute("id");
  if (!id) return [];

  const dataAttribute = daType
    .closest("DataTypeTemplates")
    ?.querySelector(`DOType > DA[type="${id}"]`);
  const daName = dataAttribute?.getAttribute("name");

  if (daName && ["Oper", "SBOw", "SBO", "Cancel"].includes(daName))
    return getServiceChildren(daName);

  const cdc = dataAttribute?.parentElement?.getAttribute("cdc");
  return getChildren(cdc, daName);
}

async function missingMandatoryChildren(daType: Element): Promise<Issue[]> {
  const mandatoryChildren = await getMandatoryChildren(daType);
  const mandatoryChildNames = mandatoryChildren.map(
    (DA) => DA.getAttribute("name")!
  );
  const missingDaNames = mandatoryChildNames.filter(
    (da) => !daType.querySelector(`BDA[name="${da}"]`)
  );

  return missingDaNames.map((missingDa) => ({
    title: `Missing mandatory child data attribute ${missingDa}`,
    message: `${daType.getAttribute("id")}`,
  }));
}

export async function dATypeValidator(daType: Element): Promise<Issue[]> {
  const errors: Issue[] = [];

  if (daType.tagName !== "DAType") return [];

  const missingChildren = await missingMandatoryChildren(daType);
  const issuesChildren = await validateChildren(daType);

  return errors.concat(missingChildren, issuesChildren);
}
