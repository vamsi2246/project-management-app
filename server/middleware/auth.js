const jwt = require("jsonwebtoken");
// Import database client
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

/**
 * JWT Verification Middleware
 */
module.exports = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) return res.status(401).json({ message: "Unauthorized" });

        const decoded = jwt.verify(token, process.env.JWT_SECRET || "supersecretkey");
        const user = await prisma.user.findUnique({ where: { id: decoded.id } });

        if (!user) return res.status(401).json({ message: "Invalid token" });

        req.user = user;
        next();
    } catch (err) {
        console.error(err);
        res.status(403).json({ message: "Token invalid/expired" });
    }
};
