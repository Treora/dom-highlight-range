# dom-highlight-range

Wrap each text node in a given DOM Range with a specified element; by default a `<span class='highlighted-range'>`.
Breaks start and/or end text nodes if needed (i.e. if only part of the text falls inside the Range).
Returns a function that removes the wrapper again (not a perfect undo: split text nodes are not merged again).


## Example

For example, if your HTML looks like this..:
```html
<p>some words and a <b>bold</b> word.</p>
```

..and your the user selects the text 'and a bo'. You run the following code:
```javascript
var selection = window.getSelection();
if (!selection.isCollapsed) {
    var range = selection.getRangeAt(0);
    var cleanup = highlightRange(range);
}
```

Now the HTML will look like this:
```html
<p>some words <span class="highlighted-range">and a </span><b><span class="highlighted-range">bo</span>ld</b> word.</p>
```

Running the returned `cleanup()` function would restore the original HTML again.

Note that it is up to you to apply styling to the class, for example by adding `.highlighted-range { background-color: yellow; }` to your CSS stylesheet.

You try it out yourself in [`example.html`](https://rawgit.com/Treora/dom-highlight-range/master/example.html).

## Install

```
npm install dom-highlight-range
```

```
// ES5 (CommonJS)
var highlightRange = require('dom-highlight-range');
// ES6+
import highlightRange from 'dom-highlight-range'
```


## API

### `highlightRange(rangeObject, highlightTemplate)`
Parameters:
- rangeObject: A DOM Range.
- highlightTemplate (optional): specifies the element to wrap the text with. Defaults to the string 'highlighted-range', and can be one of the following:
    * string: The CSS class the text pieces in the range should get.
    * HTMLElement: An element that will be cloned for each highlight.
    * function: A function that creates a wrapper element. It is passed the Text node that is being highlighted (which can safely be ignored because the wrapping is done for you).


## More examples

### Passing a CSS class

```
highlightRange(range, 'my-highlight-class');
```

### Passing a custom HTML element

```
var wrapperElement = document.createElement('mark');
highlightRange(range, wrapperElement);
```

A clone of the element will be created for each text node to be wrapped.

### Passing a custom function

Let's assume we wish to store an annotation's identifier on each wrapper:

```
function renderAnnotation(annotation, range) {
 highlightRange(range, function() {
   var span = document.createElement('span');
   span.classList.add('annotation');
   span.dataset.annotationId = annotation.id;
   return span;
 });
}
```
