# Vision Board Feature Plan

## Overview
Add vision board functionality allowing users to upload and organize photos of:
- Role models (up to 15 images)
- Lifestyle aspirations (house, travel, aesthetic)
- Body & appearance goals
- Material goals (cars, accessories, etc.)

## Implementation Approach

### Option 1: Simple (Recommended for MVP)
- Use Expo's ImagePicker to select photos from device
- Store images locally using Expo FileSystem
- Save image URIs in AsyncStorage
- Display in grid layout

**Pros:**
- No backend needed
- Fast to implement
- Works offline
- Free

**Cons:**
- Images stored only on device
- No sync across devices
- Images lost if app deleted

### Option 2: Cloud Storage (Future Enhancement)
- Upload images to cloud storage (Supabase Storage, Cloudinary, AWS S3)
- Sync across devices
- Backup and restore

## Todo List

### Phase 1: Setup & Dependencies
- [ ] Install expo-image-picker
- [ ] Install expo-file-system (for local storage)
- [ ] Update permissions in app.json (camera, photo library)

### Phase 2: Data Model
- [ ] Update JournalData type to include vision boards
- [ ] Create vision board categories (roleModels, lifestyle, body, etc.)
- [ ] Update storage service to handle image URIs

### Phase 3: UI Components
- [ ] Create VisionBoardCard component (image grid display)
- [ ] Create ImagePickerButton component
- [ ] Create ImageGallery component

### Phase 4: Screens
- [ ] Create EditVisionBoardScreen (main screen)
- [ ] Add category tabs (Role Models, Lifestyle, Body Goals, etc.)
- [ ] Add image upload functionality
- [ ] Add image deletion
- [ ] Add caption/label for each image (optional)

### Phase 5: Integration
- [ ] Add Vision Board to navigation
- [ ] Add Vision Board section to Home screen
- [ ] Display vision boards in View Journal screen
- [ ] Test image persistence

### Phase 6: Polish
- [ ] Add animations for image grid
- [ ] Add pinch-to-zoom for images
- [ ] Add image reordering (drag & drop)
- [ ] Optimize image size/quality

## Design Considerations

**Layout:**
- Grid layout (2-3 columns)
- Each category in separate tab/section
- Instagram-like aesthetic
- Tap image to view fullscreen
- Long press to delete

**User Flow:**
1. Navigate to Vision Board from Home
2. Select category (Role Models, Lifestyle, etc.)
3. Tap "+" button to add image
4. Choose from camera or photo library
5. Image appears in grid
6. Tap to view fullscreen
7. Long press to delete

**Categories:**
1. Role Models (15 max) - People you aspire to be like
2. Lifestyle - Dream house, travel destinations, environments
3. Body & Appearance - Physical goals, style inspiration
4. Success Symbols - Cars, watches, achievements
5. General Inspiration - Anything else motivating

## Questions for User

1. **Image Limits:** Should each category have a max limit? (e.g., 15 for role models, unlimited for others?)
2. **Captions:** Should users be able to add labels/captions to images?
3. **Organization:** Should images be reorderable within categories?
4. **Cloud Backup:** Want cloud storage now or later?
5. **Categories:** Do these 5 categories work, or would you prefer different ones?

