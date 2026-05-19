import {
  PanTool,
  WindowLevelTool,
  SegmentBidirectionalTool,
  StackScrollTool,
  VolumeRotateTool,
  ZoomTool,
  MIPJumpToClickTool,
  LengthTool,
  RectangleROITool,
  RectangleROIThresholdTool,
  EllipticalROITool,
  CircleROITool,
  BidirectionalTool,
  ArrowAnnotateTool,
  DragProbeTool,
  ProbeTool,
  AngleTool,
  CobbAngleTool,
  MagnifyTool,
  CrosshairsTool,
  RectangleScissorsTool,
  SphereScissorsTool,
  CircleScissorsTool,
  BrushTool,
  PaintFillTool,
  init,
  addTool,
  annotation,
  ReferenceLinesTool,
  TrackballRotateTool,
  AdvancedMagnifyTool,
  UltrasoundDirectionalTool,
  UltrasoundPleuraBLineTool,
  PlanarFreehandROITool,
  PlanarFreehandContourSegmentationTool,
  SplineROITool,
  LivewireContourTool,
  OrientationMarkerTool,
  WindowLevelRegionTool,
  SegmentSelectTool,
  RegionSegmentPlusTool,
  SegmentLabelTool,
  LivewireContourSegmentationTool,
  SculptorTool,
  SplineContourSegmentationTool,
  LabelMapEditWithContourTool,
} from '@cornerstonejs/tools';
import { AnnotationTool } from '@cornerstonejs/tools';

import { LabelmapSlicePropagationTool, MarkerLabelmapTool } from '@cornerstonejs/ai';
import * as polySeg from '@cornerstonejs/polymorphic-segmentation';

import CalibrationLineTool from './tools/CalibrationLineTool';
import ImageOverlayViewerTool from './tools/ImageOverlayViewerTool';

/**
 * wrapToolConfig - The Ultimate Stability Wrapper
 * 1. Guarantees defaultGetTextLines is null-safe (standard and threshold tools)
 * 2. Wraps the instance's renderAnnotation in a try/catch to prevent corrupted points from crashing the app
 */
const wrapToolConfig = BaseClass => {
  // If already wrapped or not a class, skip
  if (!BaseClass || !BaseClass.prototype) {
    return BaseClass;
  }

  const WrappedClass = class extends BaseClass {
    constructor(toolProps, defaultToolProps) {
      super(toolProps, defaultToolProps);
      
      // Safety 1: getTextLines (Handles: missing cachedStats, missing targetId, missing statistics)
      if (this.configuration && typeof this.configuration.getTextLines === 'function') {
        const originalGetTextLines = this.configuration.getTextLines;
        this.configuration.getTextLines = (data, targetId) => {
          // Check both standard location and threshold statistics location
          if (!data?.cachedStats?.[targetId] && !data?.cachedStats?.statistics) {
            return [];
          }
          try {
            const result = originalGetTextLines.call(this, data, targetId);
            return Array.isArray(result) ? result : [];
          } catch (e) {
            console.warn(`[SafeGetTextLines] Suppressed error in ${BaseClass.toolName}:`, e.message);
            return [];
          }
        };
        this.configuration.getTextLines._isSafe = true;
      }

      // Safety 2: Universal Render Failsafe (Handles: reading '0', missing polyline, undefined objects)
      const originalRender = this.renderAnnotation;
      if (typeof originalRender === 'function') {
        this.renderAnnotation = function(enabledElement, svgDrawingHelper, annotation) {
          // Spline-specific safety (don't even try to render if spline data is missing)
          if (
            (BaseClass.toolName === 'SplineROI' || BaseClass.toolName === 'LivewireContour') &&
            !annotation?.data?.spline
          ) {
            return false;
          }
          try {
            // @ts-ignore - originalRender is guaranteed to be a function here
            return originalRender.call(this, enabledElement, svgDrawingHelper, annotation);
          } catch (e) {
            console.warn(`[DefensiveRender] Suppressed crash in ${BaseClass.toolName}:`, e.message);
            return false;
          }
        };
      }

      // Safety 3: isPointNearTool (Handles: hover crashes during initialization)
      const originalIsPointNear = this.isPointNearTool;
      if (typeof originalIsPointNear === 'function') {
        this.isPointNearTool = (element, annotation, canvasCoords, proximity) => {
          try {
            return originalIsPointNear.call(this, element, annotation, canvasCoords, proximity);
          } catch (e) {
            return false;
          }
        };
      }
    }
  };

  // Preserve static metadata which OHIF/Cornerstone relies on
  WrappedClass.toolName = BaseClass.toolName;
  return WrappedClass;
};

export default function initCornerstoneTools(configuration = {}) {
  CrosshairsTool.isAnnotation = false;
  LabelmapSlicePropagationTool.isAnnotation = false;
  MarkerLabelmapTool.isAnnotation = false;
  ReferenceLinesTool.isAnnotation = false;
  AdvancedMagnifyTool.isAnnotation = false;
  PlanarFreehandContourSegmentationTool.isAnnotation = false;

  init({
    addons: {
      polySeg,
    },
    computeWorker: {
      autoTerminateOnIdle: {
        enabled: false,
      },
    },
  });

  // Global Tool Protection Registry helper
  const _addTool = toolClass => addTool(wrapToolConfig(toolClass));

  _addTool(PanTool);
  _addTool(SegmentBidirectionalTool);
  _addTool(WindowLevelTool);
  _addTool(StackScrollTool);
  _addTool(VolumeRotateTool);
  _addTool(ZoomTool);
  _addTool(ProbeTool);
  _addTool(MIPJumpToClickTool);
  _addTool(LengthTool);
  _addTool(RectangleROITool);
  _addTool(RectangleROIThresholdTool);
  _addTool(EllipticalROITool);
  _addTool(CircleROITool);
  _addTool(BidirectionalTool);
  _addTool(ArrowAnnotateTool);
  _addTool(DragProbeTool);
  _addTool(AngleTool);
  _addTool(CobbAngleTool);
  _addTool(MagnifyTool);
  _addTool(CrosshairsTool);
  _addTool(RectangleScissorsTool);
  _addTool(SphereScissorsTool);
  _addTool(CircleScissorsTool);
  _addTool(BrushTool);
  _addTool(PaintFillTool);
  _addTool(ReferenceLinesTool);
  _addTool(CalibrationLineTool);
  _addTool(TrackballRotateTool);
  _addTool(ImageOverlayViewerTool);
  _addTool(AdvancedMagnifyTool);
  _addTool(UltrasoundDirectionalTool);
  _addTool(UltrasoundPleuraBLineTool);
  _addTool(PlanarFreehandROITool);
  _addTool(SplineROITool);
  _addTool(LivewireContourTool);
  _addTool(OrientationMarkerTool);
  _addTool(WindowLevelRegionTool);
  _addTool(PlanarFreehandContourSegmentationTool);
  _addTool(SegmentSelectTool);
  _addTool(SegmentLabelTool);
  _addTool(LabelmapSlicePropagationTool);
  _addTool(MarkerLabelmapTool);
  _addTool(RegionSegmentPlusTool);
  _addTool(LivewireContourSegmentationTool);
  _addTool(SculptorTool);
  _addTool(SplineContourSegmentationTool);
  _addTool(LabelMapEditWithContourTool);

  // Global Prototype Guard for background/stray checks
  const _origNearCheck = AnnotationTool.prototype._imagePointNearToolOrHandle;
  AnnotationTool.prototype._imagePointNearToolOrHandle = function (
    element,
    annotation,
    canvasCoords,
    proximity
  ) {
    try {
      return _origNearCheck.call(this, element, annotation, canvasCoords, proximity);
    } catch (e) {
      return false;
    }
  };

  // Modify annotation tools to use premium design tokens
  const annotationStyle = {
    textBoxFontSize: '15px',
    lineWidth: '1.5',
  };

  const defaultStyles = annotation.config.style.getDefaultToolStyles();
  annotation.config.style.setDefaultToolStyles({
    global: {
      ...defaultStyles.global,
      ...annotationStyle,
    },
  });
}

const toolNames = {
  Pan: PanTool.toolName,
  ArrowAnnotate: ArrowAnnotateTool.toolName,
  WindowLevel: WindowLevelTool.toolName,
  StackScroll: StackScrollTool.toolName,
  Zoom: ZoomTool.toolName,
  VolumeRotate: VolumeRotateTool.toolName,
  MipJumpToClick: MIPJumpToClickTool.toolName,
  Length: LengthTool.toolName,
  DragProbe: DragProbeTool.toolName,
  Probe: ProbeTool.toolName,
  RectangleROI: RectangleROITool.toolName,
  RectangleROIThreshold: RectangleROIThresholdTool.toolName,
  EllipticalROI: EllipticalROITool.toolName,
  CircleROI: CircleROITool.toolName,
  Bidirectional: BidirectionalTool.toolName,
  Angle: AngleTool.toolName,
  CobbAngle: CobbAngleTool.toolName,
  Magnify: MagnifyTool.toolName,
  Crosshairs: CrosshairsTool.toolName,
  Brush: BrushTool.toolName,
  PaintFill: PaintFillTool.toolName,
  ReferenceLines: ReferenceLinesTool.toolName,
  CalibrationLine: CalibrationLineTool.toolName,
  TrackballRotateTool: TrackballRotateTool.toolName,
  CircleScissors: CircleScissorsTool.toolName,
  RectangleScissors: RectangleScissorsTool.toolName,
  SphereScissors: SphereScissorsTool.toolName,
  ImageOverlayViewer: ImageOverlayViewerTool.toolName,
  AdvancedMagnify: AdvancedMagnifyTool.toolName,
  UltrasoundDirectional: UltrasoundDirectionalTool.toolName,
  UltrasoundAnnotation: UltrasoundPleuraBLineTool.toolName,
  SplineROI: SplineROITool.toolName,
  LivewireContour: LivewireContourTool.toolName,
  PlanarFreehandROI: PlanarFreehandROITool.toolName,
  OrientationMarker: OrientationMarkerTool.toolName,
  WindowLevelRegion: WindowLevelRegionTool.toolName,
  PlanarFreehandContourSegmentation: PlanarFreehandContourSegmentationTool.toolName,
  SegmentBidirectional: SegmentBidirectionalTool.toolName,
  SegmentSelect: SegmentSelectTool.toolName,
  SegmentLabel: SegmentLabelTool.toolName,
  LabelmapSlicePropagation: LabelmapSlicePropagationTool.toolName,
  MarkerLabelmap: MarkerLabelmapTool.toolName,
  RegionSegmentPlus: RegionSegmentPlusTool.toolName,
  LivewireContourSegmentation: LivewireContourSegmentationTool.toolName,
  SculptorTool: SculptorTool.toolName,
  SplineContourSegmentation: SplineContourSegmentationTool.toolName,
  LabelMapEditWithContourTool: LabelMapEditWithContourTool.toolName,
};

export { toolNames };
