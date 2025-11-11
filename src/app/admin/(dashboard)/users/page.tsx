"use client";

import React, { useEffect, useState } from "react";
import * as Yup from "yup";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { createUserWithRole, fetchAllUsers, updateUserProfile as updateUserProfileSvc } from "@/service/firebaseAuthService";

const schema = Yup.object().shape({
	firstName: Yup.string().required("First name is required."),
	lastName: Yup.string().required("Last name is required."),
	email: Yup.string().required("Email is required.").email("Invalid email."),
	password: Yup.string()
		.required("Password is required.")
		.matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\W).{8,}$/, "Weak password."),
	role: Yup.string().oneOf(["admin", "buyer", "vendor"]).required(),
});

const AdminUsersPage: React.FC = () => {
	const [submitting, setSubmitting] = useState(false);
	const [message, setMessage] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [users, setUsers] = useState<any[]>([]);
	const [loading, setLoading] = useState(true);
	const [open, setOpen] = useState(false);
	const [filterRole, setFilterRole] = useState<string>("all");
	const [editOpen, setEditOpen] = useState(false);
	const [selectedUser, setSelectedUser] = useState<any | null>(null);

	const { control, handleSubmit, formState: { errors }, reset } = useForm({ resolver: yupResolver(schema), defaultValues: { role: "admin" } });

	const loadUsers = async () => {
		setLoading(true);
		try {
			const list = await fetchAllUsers();
			setUsers(list);
		} catch (e: any) {
			setError(e?.message || "Failed to load users");
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		loadUsers();
	}, []);

	const onSubmit = async (data: any) => {
		setSubmitting(true);
		setMessage(null);
		setError(null);
		try {
			await createUserWithRole(data.firstName, data.lastName, data.email, data.password, data.role);
			setMessage("User created successfully.");
			reset({ firstName: "", lastName: "", email: "", password: "", role: "admin" });
			setOpen(false);
			await loadUsers();
		} catch (e: any) {
			setError(e?.message || "Failed to create user.");
		} finally {
			setSubmitting(false);
		}
	};

	const visibleUsers = filterRole === "all" ? users : users.filter((u) => u.role === filterRole);

	const onEditSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		if (!selectedUser?.id) return;
		setSubmitting(true);
		setMessage(null);
		setError(null);
		try {
			await updateUserProfileSvc(selectedUser.id, {
				firstName: selectedUser.firstName,
				lastName: selectedUser.lastName,
				email: selectedUser.email,
				isActive: !!selectedUser.isActive,
			});
			setMessage("User updated successfully.");
			setEditOpen(false);
			await loadUsers();
		} catch (e: any) {
			setError(e?.message || "Failed to update user.");
		} finally {
			setSubmitting(false);
		}
	};

	const toggleActive = async (user: any) => {
		if (!user?.id) return;
		setSubmitting(true);
		setError(null);
		try {
			await updateUserProfileSvc(user.id, { isActive: !user.isActive });
			await loadUsers();
		} catch (e: any) {
			setError(e?.message || "Failed to update user status.");
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<div>
			<div className="flex items-center justify-between mb-4 gap-4 flex-wrap">
				<h1 className="text-2xl font-bold">Users</h1>
				<div className="flex items-center gap-3 ml-auto">
					<label className="text-sm text-gray-600">Role</label>
					<select
						className="border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
						value={filterRole}
						onChange={(e) => setFilterRole(e.target.value)}
					>
						<option value="all">All</option>
						<option value="admin">Admin</option>
						<option value="buyer">Buyer</option>
						<option value="vendor">Vendor</option>
					</select>
					<button
						onClick={() => setOpen(true)}
						className="px-4 py-2 rounded bg-yellow-500 text-black text-sm font-semibold hover:bg-yellow-600"
					>
						Create New
					</button>
				</div>
			</div>

			<div className="bg-white rounded shadow">
				<div className="overflow-x-auto">
					<table className="min-w-full text-sm">
						<thead className="bg-gray-100 text-gray-700">
							<tr>
								<th className="text-left px-4 py-2">Name</th>
								<th className="text-left px-4 py-2">Email</th>
								<th className="text-left px-4 py-2">Role</th>
								<th className="text-left px-4 py-2">Active</th>
								<th className="text-left px-4 py-2">Actions</th>
							</tr>
						</thead>
						<tbody>
							{loading ? (
								<tr><td className="px-4 py-3" colSpan={5}>Loading...</td></tr>
							) : visibleUsers.length === 0 ? (
								<tr><td className="px-4 py-3" colSpan={5}>No users found.</td></tr>
							) : (
								visibleUsers.map((u) => (
									<tr key={u.id} className="border-t">
										<td className="px-4 py-2">{u.firstName} {u.lastName}</td>
										<td className="px-4 py-2">{u.email}</td>
										<td className="px-4 py-2 capitalize">{u.role}</td>
										<td className="px-4 py-2">{u.isActive ? "Yes" : "No"}</td>
										<td className="px-4 py-2">
											<div className="flex items-center gap-2">
												<button
													className="px-3 py-1 rounded border text-xs hover:bg-gray-50"
													onClick={() => { setSelectedUser({ ...u }); setEditOpen(true); }}
												>
													Edit
												</button>
												<button
													className={`px-3 py-1 rounded text-xs ${u.isActive ? "bg-red-500 text-white hover:bg-red-600" : "bg-green-500 text-white hover:bg-green-600"}`}
													onClick={() => toggleActive(u)}
													disabled={submitting}
												>
													{u.isActive ? "Revoke" : "Activate"}
												</button>
											</div>
										</td>
									</tr>
								))
							)}
						</tbody>
					</table>
				</div>
			</div>

			{open && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
					<div className="bg-white rounded shadow-lg p-5 w-full max-w-lg">
						<div className="flex items-center justify-between mb-3">
							<h2 className="text-lg font-semibold">Create New User</h2>
							<button onClick={() => setOpen(false)} className="text-gray-500 hover:text-gray-700">✕</button>
						</div>
						{message && <div className="mb-3 p-2 rounded bg-green-50 text-green-700 text-sm">{message}</div>}
						{error && <div className="mb-3 p-2 rounded bg-red-50 text-red-600 text-sm">{error}</div>}
						<form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div>
									<label className="block text-sm font-medium mb-1">First Name</label>
									<Controller
										name="firstName"
										control={control}
										defaultValue=""
										render={({ field }) => (
											<input
												{...field}
												className={`w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 ${errors.firstName ? "focus:ring-red-500 border-red-300" : "focus:ring-yellow-500 border-gray-300"}`}
											/>
										)}
									/>
									{errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName.message}</p>}
								</div>
								<div>
									<label className="block text-sm font-medium mb-1">Last Name</label>
									<Controller
										name="lastName"
										control={control}
										defaultValue=""
										render={({ field }) => (
											<input
												{...field}
												className={`w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 ${errors.lastName ? "focus:ring-red-500 border-red-300" : "focus:ring-yellow-500 border-gray-300"}`}
											/>
										)}
									/>
									{errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName.message}</p>}
								</div>
							</div>
							<div>
								<label className="block text-sm font-medium mb-1">Email</label>
								<Controller
									name="email"
									control={control}
									defaultValue=""
									render={({ field }) => (
										<input
											{...field}
											type="email"
											className={`w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 ${errors.email ? "focus:ring-red-500 border-red-300" : "focus:ring-yellow-500 border-gray-300"}`}
										/>
									)}
								/>
								{errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
							</div>
							<div>
								<label className="block text-sm font-medium mb-1">Password</label>
								<Controller
									name="password"
									control={control}
									defaultValue=""
									render={({ field }) => (
										<input
											{...field}
											type="password"
											className={`w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 ${errors.password ? "focus:ring-red-500 border-red-300" : "focus:ring-yellow-500 border-gray-300"}`}
										/>
									)}
								/>
								{errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
							</div>
							<div>
								<label className="block text-sm font-medium mb-1">Role</label>
								<Controller
									name="role"
									control={control}
									defaultValue="admin"
									render={({ field }) => (
										<select
											{...field}
											className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
										>
											<option value="admin">Admin</option>
											<option value="buyer">Buyer</option>
											<option value="vendor">Vendor</option>
										</select>
									)}
								/>
							</div>
							<div className="flex items-center justify-end gap-2">
								<button type="button" onClick={() => setOpen(false)} className="px-4 py-2 rounded border text-sm">Cancel</button>
								<button
									type="submit"
									disabled={submitting}
									className={`px-4 py-2 rounded bg-yellow-500 text-black text-sm font-semibold ${submitting ? "opacity-70" : "hover:bg-yellow-600"}`}
								>
									{submitting ? "Creating..." : "Create"}
								</button>
							</div>
						</form>
					</div>
				</div>
			)}

			{editOpen && selectedUser && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
					<div className="bg-white rounded shadow-lg p-5 w-full max-w-lg">
						<div className="flex items-center justify-between mb-3">
							<h2 className="text-lg font-semibold">Edit User</h2>
							<button onClick={() => setEditOpen(false)} className="text-gray-500 hover:text-gray-700">✕</button>
						</div>
						{error && <div className="mb-3 p-2 rounded bg-red-50 text-red-600 text-sm">{error}</div>}
						<form onSubmit={onEditSubmit} className="space-y-4">
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div>
									<label className="block text-sm font-medium mb-1">First Name</label>
									<input
										value={selectedUser.firstName || ""}
										onChange={(e) => setSelectedUser({ ...selectedUser, firstName: e.target.value })}
										className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-500"
									/>
								</div>
								<div>
									<label className="block text-sm font-medium mb-1">Last Name</label>
									<input
										value={selectedUser.lastName || ""}
										onChange={(e) => setSelectedUser({ ...selectedUser, lastName: e.target.value })}
										className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-500"
									/>
								</div>
							</div>
							<div>
								<label className="block text-sm font-medium mb-1">Email</label>
								<input
									value={selectedUser.email || ""}
									onChange={(e) => setSelectedUser({ ...selectedUser, email: e.target.value })}
									type="email"
									className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-500"
								/>
							</div>
							<div className="flex items-center justify-end gap-2">
								<button type="button" onClick={() => setEditOpen(false)} className="px-4 py-2 rounded border text-sm">Cancel</button>
								<button
									type="submit"
									disabled={submitting}
									className={`px-4 py-2 rounded bg-yellow-500 text-black text-sm font-semibold ${submitting ? "opacity-70" : "hover:bg-yellow-600"}`}
								>
									{submitting ? "Saving..." : "Save"}
								</button>
							</div>
						</form>
					</div>
				</div>
			)}
		</div>
	);
};

export default AdminUsersPage;


