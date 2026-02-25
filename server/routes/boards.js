const express = require('express');
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const router = express.Router();

/**
 * GET /api/boards
 * Retrieves all boards for a specific user or all boards if no userId provided
 * @query {number} userId - Optional user ID to filter boards
 * @returns {Array} List of boards with members
 */
router.get("/", async (req, res) => {
    try {
        const { userId } = req.query;

        let boards = await prisma.board.findMany({
            where: userId ? {
                OR: [
                    { createdBy: Number(userId) },
                    { members: { some: { userId: Number(userId) } } }
                ]
            } : {},
            include: {
                members: true,
            },
            orderBy: { createdAt: "desc" }
        });

        res.json(boards);
    }
    catch (err) {
        console.error("GET /boards error:", err);
        res.status(500).json({ message: "Failed to fetch boards" });
    }
});

/* ---------------- GET SINGLE BOARD ---------------- */
router.get("/:id", async (req, res) => {
    try {
        const boardId = Number(req.params.id);

        const board = await prisma.board.findUnique({
            where: { id: boardId },
            include: {
                members: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                                profilePic: true,
                            },
                        },
                    },
                },

                lists: {
                    orderBy: { order: "asc" },
                    include: {
                        cards: {
                            orderBy: { order: "asc" },
                            include: {
                                comments: { include: { user: true } },
                                labels: { include: { label: true } },
                                attachments: true,
                                activity: { include: { user: true } },
                            },
                        },
                    },
                },

                labels: true,
                comments: { include: { user: true } },
                activities: {
                    include: { user: true },
                    orderBy: { createdAt: "desc" },
                },
            },
        });

        if (!board) {
            return res.status(404).json({ message: "Board not found" });
        }

        res.json(board);

    } catch (err) {
        console.error("GET /boards/:id error:", err);
        res.status(500).json({ message: "Failed to fetch board" });
    }
});


/**
 * POST /api/boards
 * Creates a new board with template-based configuration
 * @body {string} title - Board title (required)
 * @body {string} description - Board description
 * @body {number} userId - User ID creating the board (required)
 * @body {string} deadline - Board deadline date
 * @body {number} progress - Initial progress (0-100)
 * @body {string} status - Board status
 * @body {string} template - Template name (Todo Template, Project Template, etc.)
 * @body {string} organization - Organization name
 * @returns {Object} Created board with lists and cards
 */
router.post("/", async (req, res) => {
    try {
        const { title, description, userId, deadline, progress, status, template, organization } = req.body;
        const { TEMPLATES } = require("../config/templates");

        // Input sanitization and validation
        if (!title || !userId) {
            return res.status(400).json({
                message: "Title and User ID are required"
            });
        }

        // Sanitize title - trim and limit length
        const sanitizedTitle = title.trim().substring(0, 255);
        if (sanitizedTitle.length === 0) {
            return res.status(400).json({
                message: "Title cannot be empty"
            });
        }

        // Validate userId is a number
        const userIdNum = Number(userId);
        if (isNaN(userIdNum) || userIdNum <= 0) {
            return res.status(400).json({
                message: "Invalid User ID"
            });
        }

        if (template && !TEMPLATES[template]) {
            return res.status(400).json({
                message: `Invalid template: ${template}. Available templates: ${Object.keys(TEMPLATES).join(", ")}`
            });
        }


        const board = await prisma.board.create({
            data: {
                title: sanitizedTitle,
                description: description?.trim() || "",
                organization: organization?.trim() || "",
                deadline: deadline ? new Date(deadline) : null,
                progress: Math.min(Math.max(progress ?? 0, 0), 100), // Clamp between 0-100
                status: status || "Not Started",
                template: template || "Table",
                createdBy: userIdNum,
                members: {
                    create: { userId: userIdNum, role: "owner" },
                },
            },
        });

        // ✅ ACTIVITY LOG — BOARD CREATED
        await prisma.activity.create({
            data: {
                action: "CREATE_BOARD",
                message: `Created board "${board.title}" using ${template || "default"} template`,
                boardId: board.id,
                userId: userIdNum
            }
        });

        // Get template configuration or use default
        const templateConfig = TEMPLATES[template] || TEMPLATES["Table"];
        const defaultLists = templateConfig.lists;

        // Create lists based on template
        const createdLists = {};
        for (const list of defaultLists) {
            const createdList = await prisma.list.create({
                data: {
                    title: list.title,
                    order: list.order,
                    boardId: board.id,
                },
            });
            createdLists[list.title] = createdList.id;
        }

        // Create default cards if template has them
        if (templateConfig.defaultCards && templateConfig.defaultCards.length > 0) {
            for (const card of templateConfig.defaultCards) {
                const listId = createdLists[card.listTitle];
                if (listId) {
                    await prisma.card.create({
                        data: {
                            title: card.title,
                            description: card.description,
                            order: card.order,
                            listId: listId,
                        },
                    });
                }
            }
        }

        const fullBoard = await prisma.board.findUnique({
            where: { id: board.id },
            include: {
                lists: {
                    orderBy: { order: "asc" },
                    include: { cards: { orderBy: { order: "asc" } } }
                },
            },
        });

        res.status(201).json(fullBoard);
    } catch (err) {
        console.error("Error creating board:", err);

        // More specific error messages
        if (err.code === 'P2002') {
            return res.status(409).json({ message: "A board with this name already exists" });
        }
        if (err.code === 'P2003') {
            return res.status(400).json({ message: "Invalid user ID" });
        }

        res.status(500).json({
            message: "Failed to create board",
            error: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
});

/* ---------------- UPDATE BOARD ---------------- */
router.put("/:id", async (req, res) => {
    try {
        const boardId = Number(req.params.id);

        const updated = await prisma.board.update({
            where: { id: boardId },
            data: req.body
        });

        // ✅ ACTIVITY LOG — BOARD UPDATED
        await prisma.activity.create({
            data: {
                action: "UPDATE_BOARD",
                message: `Updated board "${updated.title}"`,
                boardId: updated.id,
                userId: updated.createdBy
            }
        });

        res.json(updated);
    } catch (err) {
        console.error("PUT /boards/:id error:", err);
        res.status(500).json({ message: "Failed to update board" });
    }
});

/* ---------------- DELETE BOARD ---------------- */
router.delete("/:id", async (req, res) => {
    try {
        const boardId = Number(req.params.id);

        const board = await prisma.board.findUnique({ where: { id: boardId } });

        await prisma.board.delete({
            where: { id: boardId },
        });

        // ✅ ACTIVITY LOG — BOARD DELETED
        await prisma.activity.create({
            data: {
                action: "DELETE_BOARD",
                message: `Deleted board "${board.title}"`,
                userId: board.createdBy
            }
        });

        res.json({ message: "Board deleted successfully" });
    } catch (err) {
        console.error("DELETE /boards/:id error:", err);
        res.status(500).json({ message: "Failed to delete board" });
    }
});

/* ---------------- ADD MEMBER TO BOARD ---------------- */
router.post("/:id/members", async (req, res) => {
    try {
        const boardId = Number(req.params.id);
        const { userId, role } = req.body;

        if (!userId) return res.status(400).json({ message: "User ID required" });

        // Check if already member
        const existing = await prisma.boardMember.findFirst({
            where: { boardId, userId: Number(userId) }
        });

        if (existing) {
            return res.status(400).json({ message: "User is already a member" });
        }

        const member = await prisma.boardMember.create({
            data: {
                boardId,
                userId: Number(userId),
                role: role || "viewer"
            },
            include: { user: true }
        });

        // ✅ ACTIVITY LOG — MEMBER ADDED
        await prisma.activity.create({
            data: {
                action: "ADD_MEMBER",
                message: `Added ${member.user.name} to the board`,
                boardId,
                userId: Number(userId) // The user who was added (or the adder? usually the adder, but simplified here)
            }
        });

        res.json(member);
    } catch (err) {
        console.error("POST /boards/:id/members error:", err);
        res.status(500).json({ message: "Failed to add member" });
    }
});

module.exports = router;
