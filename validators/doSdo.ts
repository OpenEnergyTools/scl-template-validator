/* eslint-disable no-promise-executor-return */
import { Issue, getTypeChild, isTypeMissing } from "../foundation.js";

export async function dOValidator(doOrSdo: Element): Promise<Issue[]> {
  if (isTypeMissing(doOrSdo))
    return [
      {
        title: `Missing mandatory attribute type`,
        message: `${doOrSdo.parentElement?.getAttribute(
          "id"
        )}>${doOrSdo.getAttribute("name")}`,
      },
    ];

  const child = getTypeChild(doOrSdo);
  if (child === null)
    return [
      {
        title: `Type attribute is not referencing any DOType`,
        message: `${doOrSdo.parentElement?.getAttribute(
          "id"
        )}>${doOrSdo.getAttribute("name")}`,
      },
    ];

  return [];
}
