/**
 * Defines the position of a control or part of a control.
 *
 * @module jidejs/ui/Pos
 */
define(function() {
	/**
	 * @memberof module:jidejs/ui/Pos
	 * @enum
	 */
	return {
		/**
		 * The object should be placed at the top.
		 */
		TOP: 0,
		/**
		 * The object should be placed at the left.
		 */
		LEFT: 1,
		/**
		 * The object should be placed at the right.
		 */
		RIGHT: 2,
		/**
		 * The object should be placed at the bottom.
		 */
		BOTTOM: 3,

		/**
		 * The object should be aligned at the bottom and should be centered horizontally.
		 */
		BOTTOM_CENTER: 4,
		/**
		 * The object should be placed at the bottom and should be left aligned.
		 */
		BOTTOM_LEFT: 5,
		/**
		 * The object should be placed at the bottom and should be right aligned.
		 */
		BOTTOM_RIGHT: 6,
		/**
		 * The object should be centered horizontally and vertically.
		 */
		CENTER: 7,
		/**
		 * The object should be centered vertically and left aligned.
		 */
		CENTER_LEFT: 8,
		/**
		 * The object should be centered vertically and right aligned.
		 */
		CENTER_RIGHT: 9,
		/**
		 * The object should be aligned at the top and centered horizontally.
		 */
		TOP_CENTER: 10,
		/**
		 * The object should be aligned at the top and left horizontally.
		 */
		TOP_LEFT: 11,
		/**
		 * The object should be aligned at the top and right horizontally.
		 */
		TOP_RIGHT: 12
	};
});