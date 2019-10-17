# dom-highlight-range

Wrap each text node in a given DOM Range with a `<mark>` element.
Breaks start and/or end node if needed.
Returns a function that cleans up the created highlight (not a perfect undo: split text nodes are not merged again).

Parameters:
- `rangeObject`: a Range whose start and end containers are text nodes.
- `highlightElement`: the element used to wrap text nodes. Defaults to `'mark'`.
- `highlightClass`: if defined, this CSS class will be given to the wrapper elements.


## Example usage

```javascript
import highlightRange from 'dom-highlight-range';

// Highlight the text currently selected by the user, if any.
var selection = window.getSelection();
if (!selection.isCollapsed) {
        var range = selection.getRangeAt(0);
        var cleanup = highlightRange(range, 'span', 'some-CSS-class');
        // Running cleanup() would remove the highlight again.
}
```
