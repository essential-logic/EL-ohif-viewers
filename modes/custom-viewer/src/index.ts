import { ToolbarService, utils } from '@ohif/core';
import { initToolGroups, toolbarButtons } from '../../basic/src/index';

const { TOOLBAR_SECTIONS } = ToolbarService;
const { structuredCloneWithFunctions } = utils;

const id = '@ohif/mode-custom-viewer';

const ohif = {
  sopClassHandler: '@ohif/extension-default.sopClassHandlerModule.stack',
  wsiSopClassHandler:
    '@ohif/extension-cornerstone.sopClassHandlerModule.DicomMicroscopySopClassHandler',
};

const cornerstone = {
  viewport: '@ohif/extension-cornerstone.viewportModule.cornerstone',
};

const NON_IMAGE_MODALITIES = ['ECG', 'SEG', 'RTSTRUCT', 'RTPLAN', 'PR', 'SR'];

const extensionDependencies = {
  '@ohif/extension-default': '^3.0.0',
  '@ohif/extension-cornerstone': '^3.0.0',
  // Our new custom UI extension
  '@ohif/extension-custom-ui': '^1.0.0',
};

const sopClassHandlers = [ohif.sopClassHandler, ohif.wsiSopClassHandler];

const toolbarSections = {
  [TOOLBAR_SECTIONS.primary]: [
    'MeasurementTools',
    'Zoom',
    'Pan',
    'TrackballRotate',
    'WindowLevel',
    'Capture',
    'Layout',
    'Crosshairs',
    'MoreTools',
  ],
  [TOOLBAR_SECTIONS.viewportActionMenu.topLeft]: ['orientationMenu', 'dataOverlayMenu'],
  [TOOLBAR_SECTIONS.viewportActionMenu.bottomMiddle]: ['AdvancedRenderingControls'],
  AdvancedRenderingControls: [
    'windowLevelMenuEmbedded',
    'voiManualControlMenu',
    'Colorbar',
    'opacityMenu',
    'thresholdMenu',
  ],
  [TOOLBAR_SECTIONS.viewportActionMenu.topRight]: [
    'modalityLoadBadge',
    'trackingStatus',
    'navigationComponent',
  ],
  [TOOLBAR_SECTIONS.viewportActionMenu.bottomLeft]: ['windowLevelMenu'],
  MeasurementTools: [
    'Length',
    'Bidirectional',
    'ArrowAnnotate',
    'EllipticalROI',
    'RectangleROI',
    'CircleROI',
    'PlanarFreehandROI',
  ],
  MoreTools: ['Reset', 'rotate-right', 'flipHorizontal', 'invert', 'Magnify', 'TagBrowser'],
};

/**
 * The key change: layout ID points to our @ohif/extension-custom-ui.
 * This makes OHIF render our Material UI component instead of the default one.
 */
const customLayout = {
  id: '@ohif/extension-custom-ui.layoutTemplateModule.customMaterialLayout',
  props: {
    viewports: [
      {
        namespace: cornerstone.viewport,
        displaySetsToDisplay: [ohif.sopClassHandler, ohif.wsiSopClassHandler],
      },
    ],
  },
};

function layoutTemplate({ studyInstanceUIDs }) {
  return {
    ...structuredCloneWithFunctions(this.layoutInstance),
    props: {
      ...this.layoutInstance.props,
      studyInstanceUIDs,
    },
  };
}

const customRoute = {
  path: 'custom-viewer',
  layoutTemplate,
  layoutInstance: customLayout,
};

function onModeEnter({ servicesManager, extensionManager, commandsManager }: withAppTypes) {
  const { measurementService, toolbarService, toolGroupService } = servicesManager.services;

  measurementService.clearMeasurements();
  initToolGroups(extensionManager, toolGroupService, commandsManager);

  // Filter out toolbar buttons that use evaluate functions from extensions
  // not loaded in this mode (e.g. hasSegmentation needs dicom-seg extension).
  const segEvalNames = ['evaluate.cornerstone.hasSegmentation'];
  const filteredButtons = this.toolbarButtons.filter(btn => {
    const evaluate = btn?.props?.evaluate;
    if (!evaluate) {
      return true;
    }
    const evals = Array.isArray(evaluate) ? evaluate : [evaluate];
    return !evals.some(e => {
      const name = typeof e === 'string' ? e : e?.name;
      return segEvalNames.includes(name);
    });
  });

  toolbarService.register(filteredButtons);

  for (const [key, section] of Object.entries(this.toolbarSections)) {
    toolbarService.updateSection(key, section);
  }
}

function onModeExit({ servicesManager }: withAppTypes) {
  const {
    toolGroupService,
    syncGroupService,
    segmentationService,
    cornerstoneViewportService,
    uiDialogService,
    uiModalService,
  } = servicesManager.services;

  uiDialogService.hideAll();
  uiModalService.hide();
  toolGroupService.destroy();
  syncGroupService.destroy();
  segmentationService.destroy();
  cornerstoneViewportService.destroy();
}

function isValidMode({ modalities }) {
  const modalities_list = modalities.split('\\');
  return {
    valid: !!modalities_list.find(modality => NON_IMAGE_MODALITIES.indexOf(modality) === -1),
    description: `The mode does not support studies that ONLY include: ${NON_IMAGE_MODALITIES.join(', ')}`,
  };
}

const modeInstance = {
  id,
  routeName: 'custom-viewer',
  displayName: 'Custom Material UI Viewer',
  _activatePanelTriggersSubscriptions: [],
  toolbarSections,
  onModeEnter,
  onModeExit,
  validationTags: { study: [], series: [] },
  isValidMode,
  routes: [customRoute],
  extensions: extensionDependencies,
  hangingProtocol: 'default',
  sopClassHandlers,
  toolbarButtons,
  enableSegmentationEdit: false,
  nonModeModalities: NON_IMAGE_MODALITIES,
};

function modeFactory({ modeConfiguration }) {
  return modeInstance;
}

const mode = {
  id,
  modeFactory,
  modeInstance,
  extensionDependencies,
};

export default mode;
