

export default function isAdmin(req, res, next) {
    if (!req.user) {
        return res.status(403).json({ message: "Authentication context missing. Please ensure you are logged in." });
    }

    if (req.user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
    }

    next();
}
