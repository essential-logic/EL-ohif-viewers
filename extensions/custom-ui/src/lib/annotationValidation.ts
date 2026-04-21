export interface ValidationResult {
  isValid: boolean;
  reason?: string;
}

/**
 * Validates a Cornerstone3D annotation object.
 * Checks for missing handles, points, and non-numerical coordinates.
 */
export function validateAnnotation(annotation: unknown): ValidationResult {
  if (!annotation || typeof annotation !== 'object') {
    return { isValid: false, reason: 'Annotation is null or not an object' };
  }

  const ann = annotation as any;
  const toolName = ann.toolName || ann.type;
  const data = ann.data || {};

  // Cornerstone3D tools store coordinates in data.handles.points
  // OHIF MeasurementService often maps them to a root-level points property
  const points = data.handles?.points || ann.points;

  // List of tools that strictly require at least 2 valid points to render without crashing
  const pointRequiringTools = [
    'CircleROI',
    'Length',
    'ArrowAnnotate',
    'RectangleROI',
    'EllipticalROI',
    'Angle',
    'CobbAngle',
    'Bidirectional',
  ];

  if (pointRequiringTools.includes(toolName)) {
    if (!Array.isArray(points) || points.length < 2) {
      return {
        isValid: false,
        reason: `Tool "${toolName}" requires at least 2 points, but found ${points?.length || 0}`,
      };
    }

    // Check that each required point is a valid array of 3 numbers
    for (let i = 0; i < points.length; i++) {
      const p = points[i];
      if (!Array.isArray(p) || p.length < 2) {
        return {
          isValid: false,
          reason: `Point at index ${i} is invalid or incomplete: ${JSON.stringify(p)}`,
        };
      }

      // Ensure coordinates are actual numbers (not NaN or undefined)
      if (isNaN(p[0]) || isNaN(p[1]) || p[0] === undefined || p[1] === undefined) {
        return {
          isValid: false,
          reason: `Point at index ${i} contains non-numerical coordinates: ${JSON.stringify(p)}`,
        };
      }
    }
  }

  // Special check for Bidirectional (requires 4 points)
  if (toolName === 'Bidirectional' && points && points.length < 4) {
    return {
      isValid: false,
      reason: `Bidirectional tool requires 4 points, but found ${points.length}`,
    };
  }

  return { isValid: true };
}

/**
 * Filters a list of measurements, returning only those that pass validation.
 */
export function filterValidMeasurements(measurements: unknown[]): any[] {
  return (measurements as any[]).filter(m => {
    const result = validateAnnotation(m);
    if (!result.isValid) {
      console.warn(
        `[AnnotationValidation] Skipping invalid annotation (${m.toolName || m.type}): ${result.reason}`,
        m
      );
      return false;
    }
    return true;
  });
}
