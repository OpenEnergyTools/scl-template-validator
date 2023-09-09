import { Issue, getTypeChild, isTypeMissing } from "../foundation.js";

export async function dAValidator(element: Element): Promise<Issue[]> {
  if (isTypeMissing(element))
    return [
      {
        title: `Missing mandatory attribute type`,
        message: `${element.parentElement?.getAttribute(
          "id"
        )}>${element.getAttribute("name")}`,
      },
    ];

  const child = getTypeChild(element);
  if (child === null)
    return [
      {
        title: `Type attribute is not referencing any DAType or EnumType`,
        message: `${element.parentElement?.getAttribute(
          "id"
        )}>${element.getAttribute("name")}`,
      },
    ];

  return [];
}
