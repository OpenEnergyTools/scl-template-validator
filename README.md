# scl-template-validator

This repository checks the `DataTypeTemplates` section of an System Configuration Language (SCL) file for issues that are not specified in the XSD. The validation is done with the help of NameSpaceDescription (NSD) files. As such the validation can only be performed for Edition 2.1 and higher as only for those version NSD files exist.

The validator is returning issues asynchronously in chunks grouped to the elements in the data type templates section and does so though a generator. You can use the `validate` generator like so:

```ts
for await (const issueGroup of validate(this.doc)) {
  // DO something with the Issue[]
}
```

## Validation per element group

The template validation is at the moment very rudimentary:

- LNodeType

  - missing `lnClass` attribute
  - missing mandatory child data object (e.g. `Beh` in `LLN0`)

- DOType

  - missing `cdc` attribute
  - incorrect `cdc` (e.g. DO.Beh is referencing a DOType with cdc="APC")
  - missing mandatory child data attributes (e.g. `Open` with `ctlModel` anything else than `status-only`)

- DAType

  - missing mandatory child data attributes (e.g. `ctlVal` in `Oper`)

- DO or SDO

  - missing `type` attribute
  - invalid reference to `DOType`

- DA or BDA
  - missing `type` attribute for `Struct` and `Enum` type data attributes
  - invalid reference to `DAType`
