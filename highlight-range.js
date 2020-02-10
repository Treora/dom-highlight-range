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
    let ancestor = range.commonAncestorContainer;
    try {
        [startNode, startOffset] = nearestTextPointInRange(range, range.startContainer, range.startOffset);
        [endNode, endOffset] = nearestTextPointInRange(range, range.endContainer, range.endOffset, true);
    } catch (error) {
        if (error instanceof TypeError) return []; // TODO create custom error type
        throw error;
    }
    // If only part of the start or end node is in the range, split it.
    if (startOffset > 0) {
        const createdNode = startNode.splitText(startOffset);
        if (endNode === startNode) {
            // If the end was in the same container, it will now be in the newly created node.
            endNode = createdNode;
            endOffset = endOffset - startOffset;
            ancestor = endNode.parentNode;
        }
        startNode = createdNode;
        startOffset = 0;
    }
    if (endOffset < endNode.length) {
        endNode.splitText(endOffset);
    }

    // Collect all the text nodes from start to end.
    const walker = startNode.ownerDocument.createTreeWalker(ancestor, NodeFilter.SHOW_TEXT);
    walker.currentNode = startNode;
    const nodes = [];
    do nodes.push(walker.currentNode) while (walker.currentNode !== endNode && walker.nextNode());
    return nodes;
}


function nearestTextPointInRange(range, node, offset, reverse) {
    if (node.nodeType === Node.TEXT_NODE)
        return [node, offset];
    var walker = node.ownerDocument.createTreeWalker(
        range.commonAncestorContainer,
        NodeFilter.SHOW_TEXT
    );
    var textNode;
    if (node.nodeType === Node.PROCESSING_INSTRUCTION_NODE ||
        node.nodeType === Node.COMMENT_NODE)
    {
        walker.currentNode = node;
        textNode = reverse ? walker.previousNode() : walker.nextNode();
    } else if (offset < node.childNodes.length) {
        walker.currentNode = node.childNodes[offset];
        textNode = reverse ? walker.previousNode() : walker.nextNode();
    } else {
        walker.currentNode = node;
        textNode = reverse
            ? walker.lastChild() || walker.previousNode()
            : walker.nextSibling();
    }
    if (textNode === null || !range.intersectsNode(textNode))
        throw new TypeError("Range contains no text nodes.");
    return [textNode, reverse ? textNode.length : 0];
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
