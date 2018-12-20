import _cloneDeep from 'lodash-es/cloneDeep';

import { dispatch as d3_dispatch } from 'd3-dispatch';
import { event as d3_event } from 'd3-selection';

import { t } from '../../util/locale';
import { uiConfirm } from '../confirm';
import { utilNoAuto, utilRebind } from '../../util';


export function uiSettingsCustomRule(context) {
    var dispatch = d3_dispatch('change');

    function render(selection) {
        var validationLayer = context.layers().layer('validation');
        var _origSettings = {
            name: context.storage('settings-custom-rule-name'),
            fileList: (validationLayer && validationLayer.fileList()) || null,
            url: context.storage('settings-custom-rule-url')
        };
        var _currSettings = _cloneDeep(_origSettings);

        // var example = 'https://{switch:a,b,c}.tile.openstreetmap.org/{zoom}/{x}/{y}.png';
        var modal = uiConfirm(selection).okButton();

        modal
            .classed('settings-modal settings-custom-data', true);

        modal.select('.modal-section.header')
            .append('h3')
            .text(t('settings.custom_rule.header'));


        var textSection = modal.select('.modal-section.message-text');

        textSection
            .append('pre')
            .attr('class', 'instructions-name')
            .text(t('settings.custom_rule.name.instructions'));

        textSection
            .append('input')
            .attr('type', 'text')
            .attr('class', 'field-name');

        textSection
            .append('pre')
            .attr('class', 'instructions-file')
            .text(t('settings.custom_rule.file.instructions'));

        textSection
            .append('input')
            .attr('class', 'field-file')
            .attr('type', 'file')
            .property('files', _currSettings.fileList)  // works for all except IE11
            .on('change', function() {
                var files = d3_event.target.files;
                if (files && files.length) {
                    _currSettings.url = '';
                    textSection.select('.field-url').property('value', '');
                    _currSettings.fileList = files;
                } else {
                    _currSettings.fileList = null;
                }
            });

        textSection
            .append('h4')
            .text(t('settings.custom_data.or'));

        textSection
            .append('pre')
            .attr('class', 'instructions-url')
            .text(t('settings.custom_rule.url.instructions'));

        textSection
            .append('textarea')
            .attr('class', 'field-url')
            .attr('placeholder', t('settings.custom_rule.url.placeholder'))
            .call(utilNoAuto)
            .property('value', _currSettings.url);


        // insert a cancel button
        var buttonSection = modal.select('.modal-section.buttons');

        buttonSection
            .insert('button', '.ok-button')
            .attr('class', 'button cancel-button secondary-action')
            .text(t('confirm.cancel'));


        buttonSection.select('.cancel-button')
            .on('click.cancel', clickCancel);

        buttonSection.select('.ok-button')
            .attr('disabled', isSaveDisabled)
            .on('click.save', clickSave);


        function isSaveDisabled() {
            return null;
        }


        // restore the original url
        function clickCancel() {
            textSection.select('.field-url').property('value', _origSettings.url);
            context.storage('settings-custom-rule-name', _origSettings.name);
            context.storage('settings-custom-rule-url', _origSettings.url);
            this.blur();
            modal.close();
        }

        // accept the current url
        function clickSave() {
            _currSettings.name = textSection.select('.field-name').property('value').trim();
            _currSettings.url = textSection.select('.field-url').property('value').trim();

            // one or the other but not both
            if (_currSettings.url) { _currSettings.fileList = null; }
            if (_currSettings.fileList) { _currSettings.url = ''; }

            context.storage('settings-custom-rule-name', _currSettings.name);
            context.storage('settings-custom-rule-url', _currSettings.url);
            this.blur();
            modal.close();
            dispatch.call('change', this, _currSettings);
        }
    }

    return utilRebind(render, dispatch, 'on');
}
