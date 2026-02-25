// Template configurations for different project types
const TEMPLATES = {
    "Todo Template": {
        name: "Todo Template",
        description: "Simple task management with basic workflow",
        lists: [
            { title: "To Do", order: 1 },
            { title: "Doing", order: 2 },
            { title: "Done", order: 3 }
        ],
        defaultCards: [
            {
                listTitle: "To Do",
                title: "Welcome to your Todo board! 👋",
                description: "Start by adding your tasks here. Click the + button to create new tasks.",
                order: 1
            },
            {
                listTitle: "To Do",
                title: "Organize your tasks",
                description: "Drag and drop tasks between columns to track progress",
                order: 2
            }
        ]
    },
    "Project Template": {
        name: "Project Template",
        description: "Complete project management workflow",
        lists: [
            { title: "Backlog", order: 1 },
            { title: "Planning", order: 2 },
            { title: "In Progress", order: 3 },
            { title: "Review", order: 4 },
            { title: "Testing", order: 5 },
            { title: "Completed", order: 6 }
        ],
        defaultCards: [
            {
                listTitle: "Backlog",
                title: "Define project requirements",
                description: "Gather and document all project requirements and user stories",
                order: 1
            },
            {
                listTitle: "Backlog",
                title: "Set up development environment",
                description: "Configure tools, dependencies, and development workflow",
                order: 2
            },
            {
                listTitle: "Planning",
                title: "Create project timeline",
                description: "Set milestones, deadlines, and sprint schedules",
                order: 1
            }
        ]
    },
    "Table": {
        name: "Table Template",
        description: "Flexible kanban board",
        lists: [
            { title: "To Do", order: 1 },
            { title: "In Progress", order: 2 },
            { title: "Done", order: 3 }
        ],
        defaultCards: []
    },
    "Agile Sprint": {
        name: "Agile Sprint",
        description: "Agile sprint planning and tracking",
        lists: [
            { title: "Sprint Backlog", order: 1 },
            { title: "In Progress", order: 2 },
            { title: "Code Review", order: 3 },
            { title: "Testing", order: 4 },
            { title: "Done", order: 5 }
        ],
        defaultCards: [
            {
                listTitle: "Sprint Backlog",
                title: "Sprint Planning Meeting",
                description: "Review and prioritize user stories for this sprint",
                order: 1
            },
            {
                listTitle: "Sprint Backlog",
                title: "Daily Standup Schedule",
                description: "Set up daily standup meetings for the team",
                order: 2
            }
        ]
    },
    "Bug Tracking": {
        name: "Bug Tracking",
        description: "Track and manage bugs",
        lists: [
            { title: "Reported", order: 1 },
            { title: "Confirmed", order: 2 },
            { title: "In Progress", order: 3 },
            { title: "Fixed", order: 4 },
            { title: "Verified", order: 5 }
        ],
        defaultCards: [
            {
                listTitle: "Reported",
                title: "Example Bug Report",
                description: "Steps to reproduce:\n1. Navigate to...\n2. Click on...\n3. Observe error\n\nExpected: ...\nActual: ...",
                order: 1
            }
        ]
    },
    "Marketing Campaign": {
        name: "Marketing Campaign",
        description: "Plan and execute marketing campaigns",
        lists: [
            { title: "Ideas", order: 1 },
            { title: "Planning", order: 2 },
            { title: "In Progress", order: 3 },
            { title: "Review", order: 4 },
            { title: "Published", order: 5 }
        ],
        defaultCards: [
            {
                listTitle: "Ideas",
                title: "Brainstorm campaign ideas",
                description: "Collect creative ideas for the campaign. Consider target audience, messaging, and channels.",
                order: 1
            },
            {
                listTitle: "Planning",
                title: "Define campaign goals",
                description: "Set clear KPIs and success metrics for the campaign",
                order: 1
            }
        ]
    }
};

module.exports = { TEMPLATES };
