import { eventTarget, EVENTS } from '@cornerstonejs/core';
import { Enums } from '@cornerstonejs/tools';
import { CommandsManager, CustomizationService } from '@ohif/core';
import { findNearbyToolData } from './utils/findNearbyToolData';

const cs3DToolsEvents = Enums.Events;

/**
 * Generates a double click event name, consisting of:
 *    * alt when the alt key is down
 *    * ctrl when the cctrl key is down
 *    * shift when the shift key is down
 *    * 'doubleClick'
 */
function getDoubleClickEventName(evt: CustomEvent) {
  const nameArr = [];
  const { event } = evt.detail;
  if (event.altKey) {
    nameArr.push('alt');
  }
  if (event.ctrlKey) {
    nameArr.push('ctrl');
  }
  if (event.shiftKey) {
    nameArr.push('shift');
  }

  // button 0 is left, button 1 is middle, button 2 is right
  if (event.button === 2) {
    nameArr.push('right');
  } else if (event.button === 1) {
    nameArr.push('middle');
  }

  nameArr.push('doubleClick');
  return nameArr.join('');
}

export type initDoubleClickArgs = {
  customizationService: CustomizationService;
  commandsManager: CommandsManager;
};

function initDoubleClick({ customizationService, commandsManager }: initDoubleClickArgs): void {
  const cornerstoneViewportHandleDoubleClick = (evt: CustomEvent) => {
    // Do not allow double click on a tool.
    const nearbyToolData = findNearbyToolData(commandsManager, evt);
    if (nearbyToolData) {
      return;
    }

    const eventName = getDoubleClickEventName(evt);

    // Allows for the customization of the double click on a viewport.
    const customizations = customizationService.getCustomization(
      'cornerstoneViewportClickCommands'
    );

    const toRun = customizations[eventName];

    if (!toRun) {
      return;
    }

    commandsManager.run(toRun, { event: evt });
  };

  // Track last right click time and element to simulate right double click
  let lastRightClickTime = 0;
  let lastRightClickElement = null;

  const cornerstoneViewportHandleMouseDown = (evt: CustomEvent) => {
    const { event, element } = evt.detail;

    // button 2 is right click
    if (event.button === 2) {
      const currentTime = Date.now();
      if (
        lastRightClickElement === element &&
        currentTime - lastRightClickTime < 300 // 300ms threshold for double click
      ) {
        // Trigger the double click handler manually
        cornerstoneViewportHandleDoubleClick(evt);
        // Reset to prevent triple click from triggering another double click
        lastRightClickTime = 0;
        lastRightClickElement = null;
      } else {
        lastRightClickTime = currentTime;
        lastRightClickElement = element;
      }
    }
  };

  function elementEnabledHandler(evt: CustomEvent) {
    const { element } = evt.detail;

    element.addEventListener(
      cs3DToolsEvents.MOUSE_DOUBLE_CLICK,
      cornerstoneViewportHandleDoubleClick
    );

    element.addEventListener(cs3DToolsEvents.MOUSE_DOWN, cornerstoneViewportHandleMouseDown);
  }

  function elementDisabledHandler(evt: CustomEvent) {
    const { element } = evt.detail;

    element.removeEventListener(
      cs3DToolsEvents.MOUSE_DOUBLE_CLICK,
      cornerstoneViewportHandleDoubleClick
    );

    element.removeEventListener(cs3DToolsEvents.MOUSE_DOWN, cornerstoneViewportHandleMouseDown);
  }

  eventTarget.addEventListener(EVENTS.ELEMENT_ENABLED, elementEnabledHandler.bind(null));

  eventTarget.addEventListener(EVENTS.ELEMENT_DISABLED, elementDisabledHandler.bind(null));
}

export default initDoubleClick;
