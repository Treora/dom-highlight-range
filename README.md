# dom-highlight-range

Wrap each text node in a given DOM Range with a `<span class=[highLightClass]>`.
Breaks start and/or end node if needed.
Returns a function that cleans up the created highlight (not a perfect undo: split text nodes are not merged again).

Parameters:
- rangeObject: a Range whose start and end containers are text nodes.
- highlightClass: the CSS class the text pieces in the range should get, defaults to 'highlighted-range'.


## Example usage

```javascript
// Highlight the text currently selected by the user, if any.
var selection = window.getSelection();
if (!selection.isCollapsed) {
        var range = selection.getRangeAt(0);
        var cleanup = highlightRange(range, 'some-CSS-class');
        // Running cleanup() would remove the highlight again.
}
```
