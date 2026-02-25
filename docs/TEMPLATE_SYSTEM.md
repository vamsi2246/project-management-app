# Template System

## Overview
The project management app now includes a comprehensive template system that allows users to quickly create boards with pre-configured workflows tailored to specific use cases.

## Features

### 6 Pre-Built Templates
1. **📝 Todo Template** - Simple task management
2. **🚀 Project Template** - Full project lifecycle management
3. **📊 Table** - Flexible kanban board
4. **⚡ Agile Sprint** - Sprint planning and tracking
5. **🐛 Bug Tracking** - Bug lifecycle management
6. **📢 Marketing Campaign** - Campaign planning and execution

### Template Features
- **Custom Lists**: Each template comes with workflow-specific lists
- **Default Cards**: Starter cards with helpful guidance
- **Visual Preview**: See list structure before creating
- **Dark Mode Support**: Full dark mode compatibility
- **Validation**: Comprehensive error handling and validation

## Technical Implementation

### Backend (`server/config/templates.js`)
```javascript
const TEMPLATES = {
  "Template Name": {
    name: "Template Name",
    description: "Template description",
    lists: [
      { title: "List Name", order: 1 }
    ],
    defaultCards: [
      {
        listTitle: "List Name",
        title: "Card Title",
        description: "Card Description",
        order: 1
      }
    ]
  }
}
```

### Frontend (`client/src/constants/templates.js`)
Contains template metadata for UI display:
- Icons
- Descriptions
- List previews
- Best use cases

### API Endpoint
**POST** `/api/boards`
- Validates template selection
- Creates board with template-specific lists
- Adds default cards if configured
- Returns ordered lists and cards

## Usage

1. Click "Create New Project"
2. Select a template from the dropdown
3. Fill in project details
4. Board is created with pre-configured lists and starter cards

## Customization

To add a new template:

1. Add template configuration to `server/config/templates.js`
2. Add template info to `client/src/constants/templates.js`
3. Add dropdown item in `Projects.jsx`
4. Update `TEMPLATES.md` documentation

## Error Handling

- Template validation on backend
- Required field validation
- Prisma error code handling
- User-friendly error messages
- Success notifications

## Dark Mode

All template UI elements support dark mode:
- Template dropdown
- Template badge
- Template info box
- List preview
- Hover states

## Future Enhancements

- Custom template creation
- Template sharing
- Template marketplace
- Template import/export
- Template analytics
