/**
 * Exception error occurring with any of the `object-builder` methods.
 */
export abstract class ObjectBuilderException extends Error {
	/**
	 * Creates a ObjectBuilder exception
	 *
	 * @param props The parameters to send to the [error]{@link error} superclass.
	 */
	public constructor(...props: Parameters<ErrorConstructor>) {
		super(...props);

		// inspired from: https://stackoverflow.com/a/48342359
		Object.setPrototypeOf(this, new.target.prototype);
	}
}
