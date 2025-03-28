import { serialize } from "cookie";

export default function handler(req, res) {
    res.setHeader(
        "Set-Cookie",
        serialize("authToken", "", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: -1, 
            path: "/",
        })
    );
    res.status(200).json({ message: "Вы вышли из системы" });
}
