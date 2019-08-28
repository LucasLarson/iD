import {
    event as d3_event,
} from 'd3-selection';

import { svgIcon } from '../../svg/icon';
import { uiTooltipHtml } from '../tooltipHtml';
import { tooltip } from '../../util/tooltip';

export function uiToolOperation(context, operationClass, tool) {

    if (!tool) tool = {};

    var operation;

    tool.itemClass = 'operation';
    tool.iconClass = 'operation-icon';

    var button,
        tooltipBehavior = tooltip()
        .placement('bottom')
        .html(true);

    tool.render = function(selection) {

        tooltipBehavior.title(uiTooltipHtml(operation.tooltip(), operation.keys[0]));

        button = selection
            .selectAll('.bar-button')
            .data([0]);

        var buttonEnter = button
            .enter()
            .append('button')
            .attr('class', 'bar-button wide')
            .attr('tabindex', -1)
            .call(tooltipBehavior)
            .on('click', function() {
                d3_event.stopPropagation();
                if (!operation || operation.disabled()) return;
                button.call(tooltipBehavior.hide);
                operation();
            })
            .call(svgIcon('#' + tool.iconName, tool.iconClass));

        button = buttonEnter.merge(button);

        button.classed('disabled', operation.disabled());
    };

    function setOperation(op) {
        operation = op;

        tool.id = operation.id;
        tool.label = operation.title;
        tool.iconName = 'iD-operation-' + operation.id;
    }

    var parentAllowed = tool.allowed;

    tool.allowed = function() {
        var mode = context.mode();
        if (mode.id !== 'select') return false;

        if (parentAllowed && !parentAllowed()) return false;

        var op = operationClass(mode.selectedIDs(), context);
        if (op.available()) {
            setOperation(op);
            return true;
        }
        return false;
    };

    tool.uninstall = function() {
        button = null;
    };

    return tool;
}
