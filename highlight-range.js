var highlightRange = (function () {
// Wrap each text node in a given DOM Range with a <span class=[highLightClass]>.
// Breaks start and/or end node if needed.
// Returns a function that cleans up the created highlight (not a perfect undo: split text nodes are not merged again).
//
// Parameters:
// - rangeObject: a Range whose start and end containers are text nodes.
// - highlightClass: the CSS class the text pieces in the range should get, defaults to 'highlighted-range'.
function highlightRange(rangeObject, highlightClass) {
    // Ignore range if empty.
    if (rangeObject.collapsed) {
        return;
    }

    if (typeof highlightClass == 'undefined') {
        highlightClass = 'highlighted-range';
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
        highlights.push(highlightNode(nodes[nodeIdx], highlightClass));
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
function textNodesInRange(rangeObject) {
    // Assert that the start and end nodes are text nodes.
    if (rangeObject.startContainer.nodeType != Node.TEXT_NODE
        || rangeObject.endContainer.nodeType != Node.TEXT_NODE) {
        throw new Error("Range end points should be text nodes. Support for other types is not implemented.");
    }

    var nodes = [];

    // Ignore range if empty.
    if (rangeObject.collapsed) {
        return nodes;
    }

    // Include (part of) the start node if needed.
    if (rangeObject.startOffset != rangeObject.startContainer.length) {
        // If only part of the start node is in the range, split it.
        if (rangeObject.startOffset != 0) {
            // Split startContainer to turn the part after the startOffset into a new node.
            var createdNode = rangeObject.startContainer.splitText(rangeObject.startOffset);

            // If the end was in the same container, it will now be in the newly created node.
            if (rangeObject.endContainer === rangeObject.startContainer) {
                rangeObject.setEnd(createdNode, rangeObject.endOffset - rangeObject.startOffset);
            }

            // Update the start node, which no longer has an offset.
            rangeObject.setStart(createdNode, 0);
        }
    }

    // Create an iterator to iterate through the nodes.
    var root = (typeof rangeObject.commonAncestorContainer != 'undefined')
               ? rangeObject.commonAncestorContainer
               : document.body; // fall back to whole document for browser compatibility
    var iter = document.createNodeIterator(root, NodeFilter.SHOW_TEXT);

    // Find the start node (could we somehow skip this seemingly needless search?)
    while (iter.referenceNode !== rangeObject.startContainer && iter.referenceNode !== null) {
        iter.nextNode();
    }

    // Add each node up to (but excluding) the end node.
    while (iter.referenceNode !== rangeObject.endContainer && iter.referenceNode !== null) {
        nodes.push(iter.referenceNode);
        iter.nextNode();
    }

    // Include (part of) the end node if needed.
    if (rangeObject.endOffset != 0) {

        // If it is only partly included, we need to split it up.
        if (rangeObject.endOffset != rangeObject.endContainer.length) {
            // Split the node, breaking off the part outside the range.
            rangeObject.endContainer.splitText(rangeObject.endOffset);
            // Note that the range object need not be updated.

            //assert(rangeObject.endOffset == rangeObject.endContainer.length);
        }

        // Add the end node.
        nodes.push(rangeObject.endContainer);
    }

    return nodes;
}


// Replace [node] with <span class=[highlightClass]>[node]</span>
function highlightNode(node, highlightClass) {
    // Create a highlight
    var highlight = document.createElement('span');
    highlight.classList.add(highlightClass);

    // Wrap it around the text node
    node.parentNode.replaceChild(highlight, node);
    highlight.appendChild(node);

    return highlight;
}


// Remove a highlight <span> created with highlightNode.
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
