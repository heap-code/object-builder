import { ObjectBuilderException } from "./object-builder.exception";

/**
 * Exception when an override is called on an unset key.
 *
 * @see [TS4113]{@link https://typescript.tv/errors/#ts4113}
 */
export class OverrideUnsetKeyException extends ObjectBuilderException {}
