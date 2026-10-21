// Source-bound presentation uses the installed 6.7.0 native wrap planner.
// Runtime signature guards keep unsupported engine versions on renderAbc.
declare module 'abcjs/src/parse/wrap_lines' {
  import type { AbcVisualParams, TuneObject } from 'abcjs';
  export function calcLineWraps(tune: TuneObject,
    widths: { left: number; measureWidths: number[]; total: number }[],
    options: AbcVisualParams): { reParse: boolean; revisedParams: AbcVisualParams };
}

// The passive Savior probe owns tuneMetrics' temporary native measurement
// node so its cleanup also runs when the version-bound width engine throws.
declare module 'abcjs/src/write/engraver-controller' {
  import type { AbcVisualParams, TuneObject } from 'abcjs';
  export default class EngraverController {
    renderer: { paper: {
      dummySvg?: SVGSVGElement | null;
      text(text: string, attributes: Record<string, unknown>, target?: SVGElement): SVGGraphicsElement;
      getTextSize(text: string | number, attributes: Record<string, unknown>, element?: SVGGraphicsElement): { width: number; height: number };
    } };
    constructor(host: HTMLElement, options: AbcVisualParams);
    getMeasureWidths(tune: TuneObject): { left: number; measureWidths: number[]; total: number }[];
  }
}
