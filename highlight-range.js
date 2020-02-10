var highlightRange = (function () {
// Wrap each text node in a given DOM Range with a <mark> or other element.
// Breaks start and/or end node if needed.
// Returns a function that cleans up the created highlight (not a perfect undo: split text nodes are not merged again).
//
// Parameters:
// - rangeObject: a Range whose start and end containers are text nodes.
// - highlightElement: the element used to wrap text nodes. Defaults to 'mark'.
// - attributes: an Object defining any attributes to be set on the wrapper elements.
function highlightRange(rangeObject, highlightElement, attributes) {
    // Ignore range if empty.
    if (rangeObject.collapsed) {
        return;
    }

    if (highlightElement === undefined) {
        highlightElement = 'mark';
    }

    // First put all nodes in an array (splits start and end nodes)
    var nodes = textNodesInRange(rangeObject);

    // Remember range details to restore it later.
    var startContainer = rangeObject.startContainer;
    var startOffset = rangeObject.startOffset;
    var endContainer = rangeObject.endContainer;
    var endOffset = rangeObject.endOffset;

    // Highlight each node
    var highlights = [];
    for (nodeIdx in nodes) {
        highlights.push(highlightNode(nodes[nodeIdx], highlightElement, attributes));
    }

    // The rangeObject gets messed up by our DOM changes. Be kind and restore.
    rangeObject.setStart(startContainer, startOffset);
    rangeObject.setEnd(endContainer, endOffset);

    // Return a function that cleans up the highlights.
    function cleanupHighlights() {
        // Remember range details to restore it later.
        var startContainer = rangeObject.startContainer;
        var startOffset = rangeObject.startOffset;
        var endContainer = rangeObject.endContainer;
        var endOffset = rangeObject.endOffset;

        // Remove each of the created highlights.
        for (var highlightIdx in highlights) {
            removeHighlight(highlights[highlightIdx]);
        }

        // Be kind and restore the rangeObject again.
        rangeObject.setStart(startContainer, startOffset);
        rangeObject.setEnd(endContainer, endOffset);
    }
    return cleanupHighlights;
}


// Return an array of the text nodes in the range. Split the start and end nodes if required.
function textNodesInRange(range) {
    // If the start or end node is a text node and only partly in the range, split it.
    if (range.startContainer.nodeType === Node.TEXT_NODE && range.startOffset > 0) {
        const endOffset = range.endOffset; // (this may get lost when the splitting the node)
        const createdNode = range.startContainer.splitText(range.startOffset);
        if (range.endContainer === range.startContainer) {
            // If the end was in the same container, it will now be in the newly created node.
            range.setEnd(createdNode, endOffset - range.startOffset);
        }
        range.setStart(createdNode, 0);
    }
    if (range.endContainer.nodeType === Node.TEXT_NODE && range.endOffset < range.endContainer.length) {
        range.endContainer.splitText(range.endOffset);
    }

    // Collect the text nodes.
    const walker = range.startContainer.ownerDocument.createTreeWalker(
        range.commonAncestorContainer,
        NodeFilter.SHOW_TEXT,
        node => range.intersectsNode(node) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT,
    );
    walker.currentNode = range.startContainer;

    // // Optimise by skipping nodes that are explicitly outside the range.
    // const NodeTypesWithCharacterOffset = [
    //    Node.TEXT_NODE,
    //    Node.PROCESSING_INSTRUCTION_NODE,
    //    Node.COMMENT_NODE,
    // ];
    // if (!NodeTypesWithCharacterOffset.includes(range.startContainer.nodeType)) {
    //     if (range.startOffset < range.startContainer.childNodes.length) {
    //         walker.currentNode = range.startContainer.childNodes[range.startOffset];
    //     } else {
    //         walker.nextSibling(); // TODO verify this is correct.
    //     }
    // }

    const nodes = [];
    if (walker.currentNode.nodeType === Node.TEXT_NODE)
        nodes.push(walker.currentNode);
    while (walker.nextNode() && range.comparePoint(walker.currentNode, 0) !== 1)
        nodes.push(walker.currentNode);
    return nodes;
}


// Replace [node] with <highlightElement ...attributes>[node]</highlightElement>
function highlightNode(node, highlightElement, attributes) {
    // Create a highlight
    var highlight = document.createElement(highlightElement);

    // Set the requested attributes
    if (attributes) {
        var keys = Object.keys(attributes);
        for (var i = 0; i < keys.length; i++) {
          var key = keys[i];
          var value = attributes[key];
          highlight.setAttribute(key, value);
        }
    }

    // Wrap the created element around the text node
    node.parentNode.replaceChild(highlight, node);
    highlight.appendChild(node);

    return highlight;
}


// Remove a highlight element created with highlightNode.
function removeHighlight(highlight) {
    // Move its children (normally just one text node) into its parent.
    while (highlight.firstChild) {
        highlight.parentNode.insertBefore(highlight.firstChild, highlight);
    }
    // Remove the now empty node
    highlight.remove();
}

return highlightRange;
})();

if (typeof module !== 'undefined') {
    module.exports = highlightRange;
}
