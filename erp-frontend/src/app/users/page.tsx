"use client";

import { useEffect, useState } from "react";
import { Layout } from '@/components/Layout';
import dataViewStyles from '@/assets/common/DataView.module.scss';

type MemberRole = | "SYSTEM_ADMIN" | "PRODUCTION_MANAGER" | "EMPLOYEE";

interface User {
    id: number;
    name: string;
    email: string;
    role: MemberRole;
    createdAt: string;
}

const roleNames: Record<MemberRole, string> = {
    SYSTEM_ADMIN: "시스템 관리자",
    PRODUCTION_MANAGER: "생산 관리자",
    EMPLOYEE: "일반 임직원"
};

export default function UsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [savingId, setSavingId] = useState<number | null>(null);

    const fetchUsers = async () => {
        try {
            setError("");

            const token = localStorage.getItem("token");

            const response = await fetch("http://localhost:8080/api/admin/users", {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (!response.ok) {
                throw new Error(`회원 목록 조회 실패 (${response.status})`);
            }

            const data: User[] = await response.json();
            setUsers(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : "조회 오류");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const changeRole = async (userId: number, role: MemberRole) => {
        const confirmed = window.confirm(`${roleNames[role]} 권한으로 변경할까요?`);

        if (!confirmed) return;

        try {
            setSavingId(userId);

            const token = localStorage.getItem("token");

            const response = await fetch(`http://localhost:8080/api/admin/users/${userId}/role`, {
                method: "PUT",
                headers: { 
                    "Content-Type": "application/json", 
                    Authorization: `Bearer ${token}` 
                },
                body: JSON.stringify({ role })
            });

            if (!response.ok) {
                throw new Error(`권한 변경 실패 (${response.status})`);
            }

            alert("사용자 권한이 변경되었습니다.");
            await fetchUsers();
        } catch (err) {
            alert(err instanceof Error ? err.message : "권한 변경 중 오류가 발생했습니다.");
        } finally {
            setSavingId(null);
        }
    };

    return (
        <Layout>
            <header className={dataViewStyles.pageHeader}>
                <div>
                    <h1>사용자 권한관리</h1>
                    <p>ERP 사용자 목록과 권한을 관리합니다.</p>
                </div>
            </header>

            <section style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: "12px", padding: "24px", marginTop: "20px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", gap: "12px" }}>
                    <div>
                        <h2 style={{ fontSize: "18px", fontWeight: 700, marginBottom: "6px" }}>사용자 목록</h2>
                        <p style={{ color: "#64748b", fontSize: "13px" }}>등록된 사용자 {users.length}명</p>
                    </div>

                    <button type="button" onClick={() => {setLoading(true); fetchUsers();}} style={{ padding: "9px 16px", borderRadius: "8px", border: "1px solid #dbe2ea", background: "#fff", cursor: "pointer", fontSize: "13px" }}>새로고침</button>
                </div>

                {loading && (
                    <p style={{ padding: "20px", color: "#64748b" }}>회원 목록을 불러오는 중...</p>
                )}

                {error && (
                    <p role="alert" style={{ padding: "16px", color: "#dc2626", background: "#fef2f2", borderRadius: "8px" }}>{error}</p>
                )}

                {!loading && !error && (
                    <div style={{ overflowX: "auto" }}>
                        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "650px" }}>
                            <thead>
                                <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e5e7eb" }}>
                                    {[
                                        "회원 ID",
                                        "이름",
                                        "이메일",
                                        "현재 권한",
                                        "권한 변경"
                                    ].map((title) => (
                                        <th key={title} style={{ padding: "14px", textAlign: "left", fontSize: "13px", fontWeight: 600, color: "#475569" }}>{title}</th>
                                    ))}
                                </tr>
                            </thead>

                            <tbody>
                                {users.map((user) => (
                                    <tr key={user.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                                        <td style={{ padding: "16px 14px" }}>{user.id}</td>
                                        <td style={{ padding: "16px 14px", fontWeight: 600 }}>{user.name}</td>
                                        <td style={{ padding: "16px 14px", color: "#64748b" }}>{user.email}</td>
                                        <td style={{ padding: "16px 14px" }}>
                                            <span style={{
                                                display: "inline-block", padding: "6px 10px", borderRadius: "6px", fontSize: "12px", fontWeight: 600,
                                                background: user.role === "SYSTEM_ADMIN" ? "#dbeafe" : user.role === "PRODUCTION_MANAGER" ? "#fef3c7" : "#f1f5f9",
                                                color: user.role === "SYSTEM_ADMIN" ? "#1d4ed8" : user.role === "PRODUCTION_MANAGER" ? "#92400e" : "#475569"
                                            }}>{roleNames[user.role]}</span>
                                        </td>
                                        <td style={{ padding: "16px 14px" }}>
                                            <select aria-label={`${user.name} 권한 변경`} value={user.role} disabled={savingId !== null || user.role === "SYSTEM_ADMIN"}
                                            onChange={(e) => changeRole(user.id, e.target.value as MemberRole)}
                                            style={{ padding: "9px 12px", border: "1px solid #dbe2da", borderRadius: "8px", background: "#fff", cursor: savingId !== null || user.role === "SYSTEM_ADMIN" ? "not-allowed" : "pointer", opacity: user.role === "SYSTEM_ADMIN" ? 0.6 : 1 }}>
                                                {Object.entries(roleNames).map(([value, label]) => (
                                                    <option key={value} value={value}>{label}</option>
                                                ))}
                                            </select>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {users.length === 0 && (
                            <p style={{ padding: "30px", textAlign: "center", color: "#64748b" }}>등록된 사용자가 없습니다.</p>
                        )}
                    </div>
                )}
            </section>
        </Layout>
    )
}