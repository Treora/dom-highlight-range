# dom-highlight-range

Wrap each text node in a given DOM Range with a `<mark>` element.
Breaks start and/or end node if needed.
Returns a function that cleans up the created highlight (not a perfect undo: split text nodes are
not merged again).

Parameters:
- `range`: a DOM [Range](https://developer.mozilla.org/en-US/docs/Web/API/Range) object. Note that
  as highlighting modifies the DOM, the range may be unusable afterwards.
- `tagName`: the element used to wrap text nodes. Defaults to `'mark'`.
- `attributes`: an Object defining any attributes to be set on the wrapper elements.

## Example usage

```javascript
import highlightRange from 'dom-highlight-range';

// Highlight the text currently selected by the user, if any.
const selection = window.getSelection();
if (!selection.isCollapsed) {
        const range = selection.getRangeAt(0);
        const removeHighlights = highlightRange(range, 'span', { class: 'some-CSS-class' });
        // Running removeHighlights() would remove the highlight again.
}
```
