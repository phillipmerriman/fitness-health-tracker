// Re-export all DB row types for convenience
export type {
  Profile,
  Exercise,
  WorkoutTemplate,
  WorkoutTemplateExercise,
  WorkoutSession,
  WorkoutSet,
  Program,
  ProgramDay,
  ProgramDayExercise,
  PersonalRecord,
  BodyMeasurement,
  Tables,
  InsertDto,
  UpdateDto,
} from './database'

export type ExerciseType = 'strength' | 'cardio' | 'flexibility' | 'warm_up' | 'cool_down' | 'other'

export type ExerciseRate = 'ballistic' | 'grind'

export type MuscleGroup =
  | 'chest' | 'back' | 'shoulders' | 'biceps' | 'triceps'
  | 'forearms' | 'core' | 'quads' | 'hamstrings' | 'glutes'
  | 'calves' | 'full_body' | 'upper_body' | 'lower_body' | 'other'

export type Equipment =
  | 'barbell' | 'dumbbell' | 'machine' | 'cable'
  | 'bodyweight' | 'kettlebell' | 'band' | 'steel_mace' | 'steel_club' | 'other'

export type UnitSystem = 'imperial' | 'metric'

export type RecordType = 'max_weight' | 'max_reps' | 'max_volume' | 'max_duration'