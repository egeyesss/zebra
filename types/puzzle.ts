/**
 * TypeScript mirror of the generator's export schema
 * (`csp_generator/export/schema.py`, EXPORT_SCHEMA_VERSION 1.0.1).
 *
 * The generator is the source of truth; these types describe the JSON shape it
 * emits so the web app can consume `data/puzzles/v1.json` without guessing. Keep
 * them in lockstep with the Pydantic models: a minor schema bump (new optional
 * field) means an optional field here, a major bump means a breaking change.
 *
 * Pydantic serializes `tuple[str, str]` as a two-element JSON array, so those
 * map to `[string, string]` here, not to objects.
 */

// ---------------------------------------------------------------------------
// Clues (discriminated union on `type`)
// ---------------------------------------------------------------------------

export interface PositiveAssociation {
  type: "positive_association";
  category_a: string;
  value_a: string;
  category_b: string;
  value_b: string;
}

export interface NegativeAssociation {
  type: "negative_association";
  category_a: string;
  value_a: string;
  category_b: string;
  value_b: string;
}

export interface AbsolutePosition {
  type: "absolute_position";
  category: string;
  value: string;
  /** 0-indexed position along the row. */
  position: number;
}

export interface Adjacency {
  type: "adjacency";
  category_a: string;
  value_a: string;
  category_b: string;
  value_b: string;
}

export interface RelativePosition {
  type: "relative_position";
  /** `value_a` is somewhere to the left of `value_b` (pos_a < pos_b). */
  category_a: string;
  value_a: string;
  category_b: string;
  value_b: string;
}

export interface ImmediateLeftOf {
  type: "immediate_left_of";
  /** `value_a` is directly to the left of `value_b` (pos_b === pos_a + 1). */
  category_a: string;
  value_a: string;
  category_b: string;
  value_b: string;
}

export interface Disjunction {
  type: "disjunction";
  category_a: string;
  value_a: string;
  /** `(category_a, value_a)` shares a position with exactly one of these. */
  options: Array<[string, string]>;
}

export interface Conditional {
  type: "conditional";
  if_category_a: string;
  if_value_a: string;
  if_category_b: string;
  if_value_b: string;
  then_category_a: string;
  then_value_a: string;
  then_category_b: string;
  then_value_b: string;
}

export type RawClue =
  | PositiveAssociation
  | NegativeAssociation
  | AbsolutePosition
  | Adjacency
  | RelativePosition
  | ImmediateLeftOf
  | Disjunction
  | Conditional;

/** One clue as exported: the structured payload plus its rendered English. */
export interface ExportedClue {
  raw: RawClue;
  text: string;
}

// ---------------------------------------------------------------------------
// Theme
// ---------------------------------------------------------------------------

export interface CategoryDescriptor {
  /** Noun-phrase template containing `{value}`, e.g. "the {value} drinker". */
  subject: string;
  /** Verb-phrase template for positive associations, e.g. "drinks {value}". */
  predicate?: string | null;
  /** True when the subject is a place rather than a person. */
  is_location: boolean;
}

export interface Theme {
  id: string;
  name: string;
  description: string;
  entity_label: string;
  position_label: string;
  /** Category name -> ordered value pool. Every category has `size` values. */
  attributes: Record<string, string[]>;
  /** Per-category rendering templates (plain `{value}` string or descriptor). */
  descriptors: Record<string, string | CategoryDescriptor>;
  /** The hidden (category, value) answer, or null if nothing is suppressed. */
  question_target?: [string, string] | null;
}

// ---------------------------------------------------------------------------
// Solution
// ---------------------------------------------------------------------------

export interface Solution {
  theme_id: string;
  /** category -> values indexed by position; each is a permutation of the pool. */
  assignments: Record<string, string[]>;
}

// ---------------------------------------------------------------------------
// Metrics + review
// ---------------------------------------------------------------------------

export interface GenerationMetrics {
  clue_count: number;
  deduction_depth?: number | null;
  hypothesis_depth?: number | null;
  branching_factor?: number | null;
  clue_variety?: number | null;
  composite_difficulty?: number | null;
}

export interface ReviewData {
  approved: boolean;
  difficulty_rating: number;
  clue_variety_rating: number;
  aha_factor: number;
  notes: string;
  rejection_reason?: string | null;
}

// ---------------------------------------------------------------------------
// Puzzle + bundle
// ---------------------------------------------------------------------------

export interface ExportedPuzzle {
  id: string;
  theme: Theme;
  /** Grid size: number of positions / values per category. */
  size: number;
  question?: [string, string] | null;
  clues: ExportedClue[];
  solution: Solution;
  metrics?: GenerationMetrics | null;
  review?: ReviewData | null;
}

export interface ExportBundle {
  schema_version: string;
  generator_version: string;
  /** ISO-8601 UTC timestamp. */
  generated_at: string;
  source?: string | null;
  puzzles: ExportedPuzzle[];
}

// ---------------------------------------------------------------------------
// Web-app-side derived types (not part of the export schema)
// ---------------------------------------------------------------------------

/**
 * The two daily tracks. Derived from `size`, not stored in the export:
 * 4x4 is Coffee, 5x5 is Deep. See `lib/config.ts`.
 */
export type Track = "coffee" | "deep";
