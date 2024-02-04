import { ObjectBuilderException } from "./object-builder.exception";
import { BuilderProductKey } from "../types";

/**
 * Exception when an override is called on an unset key.
 *
 * @see [TS4113]{@link https://typescript.tv/errors/#ts4113}
 */
export class OverrideUnsetKeyException extends ObjectBuilderException {
	/**
	 * Creates an exception when an override is called with an non-existing key
	 *
	 * @param key that was being set
	 */
	public constructor(key: BuilderProductKey) {
		super(
			`The key '${key.toString()}' must already be set to be overridden.`,
		);
	}
}
