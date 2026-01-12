# Dark Mode Support for 8 Additional Screens

## Plan

Update the following 8 screens to support dark mode by:
1. Importing `useTheme` from `../hooks/useTheme`
2. Adding `const { colors } = useTheme();` at the start of the component
3. Converting the static `StyleSheet.create` to a `createStyles` function that takes `colors` as a parameter
4. Calling `const styles = createStyles(colors);` in the component
5. Updating all hardcoded color values in styles to use the dynamic `colors` object

## Pattern to Follow

Based on HomeScreen.tsx and SettingsScreen.tsx:
- Background colors: `colors.background`, `colors.backgroundLight`, `colors.backgroundDark`
- Text colors: `colors.text.primary`, `colors.text.secondary`, `colors.text.tertiary`, `colors.text.white`
- Shadow colors: `colors.shadow`
- Keep gradients and primary/secondary colors as they are (e.g., `#FF9A76`, `#8FBC8F`)

## Screens to Update

- [x] EditAffirmationsScreen.tsx
- [x] EditMorningRoutineScreen.tsx
- [x] EditEveningRoutineScreen.tsx
- [x] EditGoalsScreen.tsx
- [x] EditTraitsScreen.tsx
- [x] EditStandardsScreen.tsx
- [x] EditRemindersScreen.tsx
- [x] ViewJournalScreen.tsx

## Color Mapping

For each screen, hardcoded colors will be replaced as follows:
- `#FFF9F5` → `colors.background`
- `#FFFFFF` → `colors.backgroundLight`
- `#2C3E50`, `#34495E` → `colors.text.primary`
- `#7F8C8D`, `#5D6D7E` → `colors.text.secondary`
- `#95A5A6`, `#BDC3C7` → `colors.text.tertiary`
- `#000` (shadow) → `colors.shadow`
- Keep gradient colors like `#FF9A76`, `#8FBC8F`, etc. as-is

## Notes
- DO NOT modify any logic
- Only update styling to be theme-aware
- Follow exact pattern from HomeScreen.tsx and SettingsScreen.tsx

---

## Summary

All 8 screens have been successfully updated to support dark mode:

1. **EditAffirmationsScreen.tsx** - Added useTheme hook, converted styles to createStyles function, replaced hardcoded colors with theme colors
2. **EditMorningRoutineScreen.tsx** - Added useTheme hook, converted styles to createStyles function, replaced hardcoded colors with theme colors
3. **EditEveningRoutineScreen.tsx** - Added useTheme hook, converted styles to createStyles function, replaced hardcoded colors with theme colors
4. **EditGoalsScreen.tsx** - Added useTheme hook, converted styles to createStyles function, replaced hardcoded colors with theme colors
5. **EditTraitsScreen.tsx** - Added useTheme hook, converted styles to createStyles function, replaced hardcoded colors with theme colors
6. **EditStandardsScreen.tsx** - Added useTheme hook, converted styles to createStyles function, replaced hardcoded colors with theme colors
7. **EditRemindersScreen.tsx** - Added useTheme hook, converted styles to createStyles function, replaced hardcoded colors with theme colors
8. **ViewJournalScreen.tsx** - Added useTheme hook, converted styles to createStyles function, replaced hardcoded colors with theme colors

### Changes Applied to Each Screen:
- Imported `useTheme` from `../hooks/useTheme`
- Added `const { colors } = useTheme();` at the start of component
- Converted static `StyleSheet.create` to `createStyles` function with colors parameter
- Called `const styles = createStyles(colors);` in component
- Replaced all hardcoded color values:
  - Background colors: `#FFF9F5` → `colors.background`, `#FFFFFF` → `colors.backgroundLight`
  - Text colors: `#2C3E50`, `#34495E` → `colors.text.primary`, `#7F8C8D`, `#5D6D7E` → `colors.text.secondary`, `#95A5A6`, `#BDC3C7` → `colors.text.tertiary`
  - Shadow colors: `#000` → `colors.shadow`
  - Kept brand colors unchanged: `#FF9A76`, `#8FBC8F`, `#E74C3C` (buttons and accents)

### What Was NOT Changed:
- No logic or component behavior modified
- No changes to component structure or functionality
- Brand colors and gradients maintained as-is
- All error colors (like `#E74C3C` for remove buttons) kept unchanged
