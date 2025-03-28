import { useEffect } from "react";
import { useRouter } from "next/router";

export default function LogoutPage() {
    const router = useRouter();

    useEffect(() => {
        const logout = async () => {
            try {
                const response = await fetch("/api/logout", {
                    method: "POST",
                });

                if (response.ok) {
                    router.push("/");
                } else {
                    console.error("Ошибка при выходе из системы");
                }
            } catch (error) {
                console.error("Ошибка при соединении с сервером:", error);
            }
        };

        logout();
    }, [router]);

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <p className="text-xl font-bold text-black">
                Выход из системы...
            </p>
        </div>
    );
}

LogoutPage.hideNavbar = true;