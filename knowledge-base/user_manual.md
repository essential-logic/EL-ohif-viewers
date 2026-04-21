# Essential Logic DICOM Pro — User Manual

Welcome to **DICOM Pro**, the advanced medical imaging viewer by Essential Logic. This manual provides a comprehensive guide to navigating the interface, utilizing diagnostic tools, and leveraging AI-powered features.

---

## 1. Getting Started: The Study List
The Study List is your command center for managing patient data.

- **Searching & Filtering**: Use the search bar to find patients by Name, ID, or Date.
- **Uploading Data**:
  - **Desktop**: Drag and drop DICOM folders or click the **Upload** button (top right).
  - **Mobile**: Tap the primary floating **+** button to select files from your device.
- **External Repositories**:
  - **Public Repos**: Access datasets from TCIA, OpenNeuro, and fastMRI for research.
  - **AWS Public**: Stream medical imaging directly from public AWS S3 buckets.

**To open a study**: Click the `>` arrow on any study card.

---

## 2. The Viewer Interface
The viewer uses a modern **Glassmorphism** layout for maximum focus and visual clarity.

### 2.1 Top Glass Toolbar
The master controls are located at the top:
- **Mode Switcher**: 
  - 📚 **Studies**: Return to the patient list.
  - 🖥️ **Viewer**: Standard diagnostic review mode.
  - 🧠 **Segmentation**: Dedicated AI masking and contouring tools.
  - 📝 **Annotation**: Reporting and bounding box focus.
- **Layout Grid**: Change viewport counts (1x1, 1x2, 2x2, up to 2x3).
- **AI Assistant (Bot Icon)**: Opens the AI Radiology Copilot chat.

### 2.2 Side Panels
- **Left (Tools)**: Quick access to navigation, measurement, and export tools.
- **Right (Data)**: Tabbed access to Series Browser, DICOM Info, Segmentation layers, and Annotation lists.

---

## 3. Diagnostic Tool Reference

### 🔍 Navigation & Transformation
| Tool | Icon | Hotkey | Description |
| :--- | :--- | :--- | :--- |
| **Select (W/L)** | 🖱️ | `V` | Default navigation tool. Adjust contrast (L) and brightness (W). |
| **Pan** | ✋ | `P` | Drag the image within the viewport. |
| **Zoom** | 🔍 | `Z` | Magnify or shrink the image (also via `+` and `-`). |
| **Stack Scroll** | ↕️ | — | Smoothly scroll through slice stacks. |
| **Rotate** | 🔄 | `R` / `L` | Rotate the image 90° Clockwise or Counter-Clockwise. |
| **Flip** | ↔️ | `H` / `Shift+V` | Flip the image horizontally or vertically. |

### 📏 Measurement & Analysis
| Tool | Key Usage |
| :--- | :--- |
| **Length Tool** | Measures distances in millimeters (mm). |
| **Angle / Cobb** | Calculates degrees between two lines. |
| **ROI (Circle/Rect)** | Calculates mean, max, and area of a selected Region of Interest. |
| **Probe (HU)** | Displays Hounsfield Unit (HU) or pixel intensity at a specific point. |
| **Calibration** | Manually calibrate distance based on known lengths. |
| **Crosshairs** | Synchronize 3D position across multiple series. |

### 🛠️ Image Adjustments
- **Window/Level Presets**: Use keys `1`, `2`, `3`, `4` for instant clinical views:
  - `1`: Soft Tissue (W:400 / L:40)
  - `2`: Lung (W:1500 / L:-600)
  - `3`: Bone (W:2500 / L:480)
  - `4`: Brain (W:80 / L:40)
- **Manual Sliders**: Click the **Tune (Mixer)** icon at the bottom left to open manual Brightness and Contrast sliders.

---

## 4. AI Radiology Copilot
Located in the bottom-right corner, the **AI Copilot** is a context-aware assistant powered by Gemini.

- **Context Awareness**: The bot automatically knows which patient and study you are viewing.
- **Usage**: Ask questions like:
  - *"Summarize the metadata for this CT scan."*
  - *"What are the standard guidelines for a 5mm lung nodule?"*
  - *"How do I perform a bidirectional measurement?"*
- **Privacy**: No patient-identifiable data is sent outside the secure environment.

---

## 5. Exporting & Saving
- 📸 **Screenshot**: Click the Camera icon to capture the current viewport with overlays.
- 📥 **Download**: Download the full resolution image or a CSV report of all measurements.
- 🖨️ **Print**: Generate a print-ready layout of the active series.
- 💾 **Save Study**: Saves your zoom level, contrast, and annotations to the cloud for your next session.

---

## 6. Keyboard Shortcuts
| Action | Key |
| :--- | :--- |
| **Select / Window Level** | `V` |
| **Pan** | `P` |
| **Zoom** | `Z` |
| **Invert Colors** | `I` |
| **Toggle Cine Player** | `C` |
| **Reset View** | `Space` |
| **Next / Prev Image** | `Down` / `Up` |
| **Next / Prev Series** | `PgDn` / `PgUp` |
| **Delete Annotation** | `Backspace` |

---

## 7. Touch Gestures (Tablet & Mobile)
- **One-finger Drag**: Interaction based on active tool (e.g., W/L adjustment).
- **Two-finger Pinch**: Zoom in/out.
- **Two-finger Pan**: Move the image.
- **Horizontal Swipe (Toolbar)**: Scroll through tools if they overflow the screen.

---
*Prepared by Essential Logic Documentation Team*
