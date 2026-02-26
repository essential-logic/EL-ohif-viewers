export default {
  cornerstoneViewportClickCommands: {
    doubleClick: ['doubleClickZoom'],
    rightdoubleClick: ['doubleClickZoom'],
    button1: ['closeContextMenu'],
    button3: [
      {
        commandName: 'showCornerstoneContextMenu',
        commandOptions: {
          requireNearbyToolData: true,
          menuId: 'measurementsContextMenu',
        },
      },
    ],
  },
};
