import { Button, Col, ConfigProvider, Input, Modal, Pagination, Row, Select, Table, Spin } from "antd";
import { IoSearch } from "react-icons/io5";
import "./ManagerBuyerList.css";
import { useEffect, useContext, useState } from "react";
import TextArea from "antd/es/input/TextArea";
import { ResponsiveContext } from "../../context/responsive-context/ResponsiveContext";
import axios from "axios";
const ManagerBuyerList = () => {
	const [buyerData, setBuyerData] = useState({});
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [isConfirmOpen, setIsConfirmOpen] = useState(false);
	const [pageCurrent, setPageCurrent] = useState(1);
	const [data, setData] = useState([]);
	const [province, setProvince] = useState("");
	const [city, setCity] = useState("");
	const [address, setAddress] = useState("");
	const [pagination, setPagination] = useState({
		current: pageCurrent,
		pageSize: 5,
		total: 0,
	});
	const [loading, setLoading] = useState(false);

	const fetchData = async (page, pageSize) => {
		setLoading(true);
		try {
			const response = await axios.get("http://localhost:8888/api/account", {
				params: {
					page: page, // assuming your API uses 0-based page index
					size: pageSize,
					sort: "id",
				},
			});

			const { content, totalElements, pageNumber, pageSize: responsePageSize } = response;
			setData(content);
			setPagination({
				current: pageNumber,
				pageSize: responsePageSize,
				total: totalElements,
			});
		} catch (error) {
			console.error("Error fetching data:", error);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchData(pagination.current, pagination.pageSize);
	}, []);

	const handleTableChange = (pagination) => {
		fetchData(pagination.current, pagination.pageSize);
		if (pagination && pagination.current) {
			if (+current != pagination.current) {
				setCurrent(+pagination.current);
			}
		}
		console.log(pagination.current);
	};

	const handleInactive = async (id, active) => {
		try {
			const response = await axios.put(`http://localhost:8888/api/authenticate/staff/${active === "Active" ? "delete" : "re-active"}/${id}`);
			console.log(response);
			fetchData(pagination.current, pagination.pageSize);
		} catch (error) {
			console.error("Inactive failed:", error);
		} finally {
			setLoading(false);
		}
	};

	const { isMobile, isTablet, isDesktop } = useContext(ResponsiveContext);

	const onChangeDesktop = (pagination, filter, sorter, extra) => {
		setPageCurrent(pagination.current);
	};

	const onChangeTabMob = (current) => {
		setPageCurrent(current);
	};

	const columns = [
		{
			title: "No.",
			dataIndex: "id",
			key: "id",
			// render: (_, record, index) => {
			// 	return <>{index + 1 + 10 * (pageCurrent - 1)}</>;
			// },
		},
		{
			title: "Name",
			dataIndex: "fullName",
			key: "fullName",
		},
		{
			title: "Age",
			dataIndex: "age",
			key: "age",
		},
		{
			title: "Phone",
			dataIndex: "phone",
			key: "phone",
		},
		{
			title: "Email",
			dataIndex: "email",
			key: "email",
		},
		{
			title: "Status",
			dataIndex: "status",
			key: "status",
			// render: (_, record) => {
			// 	return <span className={`${record.status === "Active" ? "text-blue-500" : "text-red-500"}`}>{record.status}</span>;
			// },
		},
	];

	return (
		<div className="w-full px-8 pt-8">
			{isDesktop && (
				<div className="ml-[247px]">
					<h2 className="text-center text-3xl font-medium uppercase mb-4">Buyer List</h2>
					<ConfigProvider
						theme={{
							components: {
								Input: {
									colorPrimary: "var(--color-primary)",
									colorPrimaryHover: "var(--color-primary)",
									activeShadow: "0 0 0 2px rgba(34, 77, 49, 0.1)",
								},
								Button: {
									colorPrimary: "var(--color-primary)",
									colorPrimaryHover: "var(--color-primary)",
									activeShadow: "0 0 0 2px rgba(34, 77, 49, 0.1)",
								},
								Select: {
									colorPrimary: "var(--color-primary)",
									colorPrimaryHover: "var(--color-primary)",
								},
								Table: {},
							},
						}}
					>
						<Row justify={"space-between"}>
							{/* Search Component */}
							<Col xs={16} className="flex">
								<Input className="h-full rounded-tr-none rounded-br-none" />
								<Button className="h-full rounded-tl-none rounded-bl-none">
									<IoSearch className="text-xl" />
								</Button>
							</Col>
							{/* Filter Component */}
							<Col xs={6} className="flex items-center gap-3">
								<span>Status: </span>
								<Select
									className="w-full rounded-none"
									size="large"
									defaultValue={"All"}
									options={[
										{
											value: "All",
											label: "All",
										},
										{
											value: "Active",
											label: "Active",
										},
										{
											value: "Inactive",
											label: "Inactive",
										},
									]}
								/>
							</Col>
						</Row>
						{/* Table Component */}
						<Spin spinning={loading}>
							<Table
								className="mt-4 cursor-pointer"
								columns={columns}
								dataSource={data}
								pagination={pagination}
								onChange={handleTableChange}
								onRow={(record) => ({
									onClick: () => {
										setIsModalOpen(true);
										setBuyerData(record);
									},
								})}
							/>
						</Spin>
					</ConfigProvider>
					<ConfigProvider
						theme={{
							components: {
								Input: {
									colorPrimary: "#d9d9d9",
									colorPrimaryHover: "#d9d9d9",
									activeShadow: "0 0 0 0px rgba(255, 255, 255, 0)",
								},
								Button: {
									colorPrimary: `${buyerData.status === "Active" ? "#f04544" : "#1677ff"}`,
									colorPrimaryHover: `${buyerData.status === "Active" ? "#f04544" : "#1677ff"}`,
								},
							},
						}}
					>
						{/* Modal Component */}
						<Modal
							className="buyer-detail-info"
							title="Buyer Information"
							open={isModalOpen}
							onCancel={() => setIsModalOpen(false)}
							onOk={() => {
								setIsConfirmOpen(true);
							}}
							okText={`${buyerData.status === "Active" ? "Inactive" : "Active"}`}
							centered={true}
						>
							<p className="italic text-center -mt-3">
								<span className="font-medium">Id:</span> {buyerData.id}
							</p>
							<Row justify={"space-between"} className="my-3">
								<Col xs={20} className="pr-1">
									<label className="font-semibold" htmlFor="name">
										Name
									</label>
									<Input readOnly={true} value={buyerData.fullName} id="name" className="rounded-none" />
								</Col>
								<Col xs={4}>
									<label className="font-semibold" htmlFor="age">
										Age
									</label>
									<Input readOnly={true} value={buyerData.age} id="age" className="rounded-none" />
								</Col>
							</Row>
							<Row justify={"space-between"} className="my-3">
								<Col xs={14} className="pr-1">
									<label className="font-semibold" htmlFor="email">
										Email
									</label>
									<Input readOnly={true} value={buyerData.email} id="email" className="rounded-none" />
								</Col>
								<Col xs={10}>
									<label className="font-semibold" htmlFor="password">
										Password
									</label>
									<Input.Password readOnly={true} value={buyerData.passWord} id="password" className="rounded-none" />
								</Col>
							</Row>
							<Row justify={"space-between"} className="my-3">
								<label className="font-semibold" htmlFor="address">
									Address
								</label>
								{/* {console.log(buyerData.location)} */}
								<Input
									readOnly={true}
									value={`${buyerData?.location?.province}, ${buyerData?.location?.city}, ${buyerData?.location?.address}`}
									id="address"
									className="rounded-none"
								/>
							</Row>
							<Row justify={"space-between"} className="my-3">
								<Col xs={12} className="pr-1">
									<label className="font-semibold" htmlFor="career">
										Career
									</label>
									<Input readOnly={true} value={buyerData.career} id="career" className="rounded-none" />
								</Col>
								<Col xs={12}>
									<label className="font-semibold" htmlFor="phone">
										Phone Number
									</label>
									<Input readOnly={true} value={buyerData.phone} id="phone" className="rounded-none" />
								</Col>
							</Row>
							<Row justify={"space-between"} className="my-3">
								<Col xs={14} className="pr-1">
									<label className="font-semibold" htmlFor="favourite">
										Favourite
									</label>
									<Input readOnly={true} value={buyerData.favourite} id="favourite" className="rounded-none" />
								</Col>
								<Col xs={10}>
									<label className="font-semibold" htmlFor="group">
										Group
									</label>
									<Input readOnly={true} value={buyerData.group} id="group" className="rounded-none" />
								</Col>
							</Row>
							<Row justify={"space-between"} className="my-3">
								<label className="font-semibold" htmlFor="transactionHistory">
									Transaction History
								</label>
								<TextArea readOnly={true} value={buyerData.transactionHistory} id="transactionHistory" className="rounded-none" />
							</Row>
							<p className={`${buyerData.status === "Active" ? "text-blue-500" : "text-red-500"}`}>
								<span className="font-bold text-black">Status: </span>
								{buyerData.status}
							</p>
						</Modal>
					</ConfigProvider>
					<Modal
						title={`Confirm ${buyerData.status === "Active" ? "lock" : "unlock"} account`}
						open={isConfirmOpen}
						centered={true}
						width={600}
						onOk={() => {
							console.log(buyerData.id);
							handleInactive(buyerData.id, buyerData.status);
							setIsConfirmOpen(false);
							setIsModalOpen(false);
						}}
						// confirmLoading={confirmLoading}
						onCancel={() => {
							setIsConfirmOpen(false);
						}}
					>
						<p className="text-base">
							Do you want to{" "}
							<span className={`${buyerData.status === "Active" ? "text-red-500" : "text-blue-500"} font-semibold`}>{buyerData.status === "Active" ? "lock" : "unlock"}</span> this
							account?
						</p>
					</Modal>
				</div>
			)}
			{isTablet && (
				<>
					<h2 className="text-center text-3xl font-medium uppercase mb-4">Buyer List</h2>
					<ConfigProvider
						theme={{
							components: {
								Input: {
									colorPrimary: "var(--color-primary)",
									colorPrimaryHover: "var(--color-primary)",
									activeShadow: "0 0 0 2px rgba(34, 77, 49, 0.1)",
								},
								Button: {
									colorPrimary: "var(--color-primary)",
									colorPrimaryHover: "var(--color-primary)",
									activeShadow: "0 0 0 2px rgba(34, 77, 49, 0.1)",
								},
								Select: {
									colorPrimary: "var(--color-primary)",
									colorPrimaryHover: "var(--color-primary)",
								},
							},
						}}
					>
						<Row justify={"space-between"}>
							{/* Search Component */}
							<Col xs={14} className="flex">
								<Input className="h-full rounded-tr-none rounded-br-none" />
								<Button className="h-full rounded-tl-none rounded-bl-none">
									<IoSearch className="text-xl z-0" />
								</Button>
							</Col>
							{/* Filter Component */}
							<Col xs={8} className="flex items-center gap-3">
								<span>Status: </span>
								<Select
									className="w-full rounded-none"
									size="large"
									defaultValue={"All"}
									options={[
										{
											value: "All",
											label: "All",
										},
										{
											value: "Active",
											label: "Active",
										},
										{
											value: "Inactive",
											label: "Inactive",
										},
									]}
								/>
							</Col>
						</Row>
					</ConfigProvider>
					{/* Table Component */}
					<table className="w-full my-4 border-l border-r border-b border-gray-300">
						<tbody>
							{data.map((buyer) => {
								// if (index >= (pageCurrent - 1) * 10 && index < pageCurrent * 10) {
								return (
									<tr
										className={`${index % 2 === 0 ? "bg-gray-200" : ""} border border-gray-400`}
										key={index}
										onClick={() => {
											setIsModalOpen(true);
											setBuyerData(buyer);
										}}
									>
										<td className="border-t border-gray-300 w-full flex">
											<div className="w-1/4 text-left pl-2 py-2 font-bold">Name</div>
											<div className="py-2">{buyer.fullName}</div>
										</td>
										<td className="border-t border-gray-300 w-full flex">
											<div className="w-1/4 text-left pl-2 py-2 font-bold">Age</div>
											<div className="py-2">{buyer.age}</div>
										</td>
										<td className="border-t border-gray-300 w-full flex">
											<div className="w-1/4 text-left pl-2 py-2 font-bold">Phone</div>
											<div className="py-2">{buyer.phone}</div>
										</td>
										<td className="border-t border-gray-300 w-full flex">
											<div className="w-1/4 text-left pl-2 py-2 font-bold">Email</div>
											<div className="py-2">{buyer.email}</div>
										</td>
										<td className="border-t border-t-gray-300 w-full flex">
											<div className="w-1/4 text-left pl-2 py-2 font-bold">Status</div>
											<div className="py-2">{buyer.status}</div>
										</td>
									</tr>
								);
								// }
							})}
						</tbody>
					</table>
					<Pagination align="center" total={data.length} onChange={onChangeTabMob} />
					<ConfigProvider
						theme={{
							components: {
								Input: {
									colorPrimary: "#d9d9d9",
									colorPrimaryHover: "#d9d9d9",
									activeShadow: "0 0 0 0px rgba(255, 255, 255, 0)",
								},
								Button: {
									colorPrimary: `${buyerData.status === "Active" ? "#f04544" : "#1677ff"}`,
									colorPrimaryHover: `${buyerData.status === "Active" ? "#f04544" : "#1677ff"}`,
								},
							},
						}}
					>
						{/* Modal Component */}
						<Modal
							className="buyer-detail-info"
							title="Buyer Information"
							open={isModalOpen}
							onCancel={() => setIsModalOpen(false)}
							onOk={() => {
								setIsConfirmOpen(true);
							}}
							okText={`${buyerData.status === "Active" ? "Inactive" : "Active"}`}
							centered={true}
						>
							<p className="italic text-center -mt-3">
								<span className="font-medium">Id:</span> {buyerData.id}
							</p>
							<Row justify={"space-between"} className="my-3">
								<Col xs={20} className="pr-1">
									<label className="font-semibold" htmlFor="name">
										Name
									</label>
									<Input readOnly={true} value={buyerData.fullName} id="name" className="rounded-none" />
								</Col>
								<Col xs={4}>
									<label className="font-semibold" htmlFor="age">
										Age
									</label>
									<Input readOnly={true} value={buyerData.age} id="age" className="rounded-none" />
								</Col>
							</Row>
							<Row justify={"space-between"} className="my-3">
								<Col xs={14} className="pr-1">
									<label className="font-semibold" htmlFor="email">
										Email
									</label>
									<Input readOnly={true} value={buyerData.email} id="email" className="rounded-none" />
								</Col>
								<Col xs={10}>
									<label className="font-semibold" htmlFor="password">
										Password
									</label>
									<Input.Password readOnly={true} value={buyerData.password} id="password" className="rounded-none" />
								</Col>
							</Row>
							<Row justify={"space-between"} className="my-3">
								<label className="font-semibold" htmlFor="address">
									Address
								</label>
								<Input readOnly={true} value={"buyerData.address"} id="address" className="rounded-none" />
							</Row>
							<Row justify={"space-between"} className="my-3">
								<Col xs={12} className="pr-1">
									<label className="font-semibold" htmlFor="career">
										Career
									</label>
									<Input readOnly={true} value={buyerData.career} id="career" className="rounded-none" />
								</Col>
								<Col xs={12}>
									<label className="font-semibold" htmlFor="phone">
										Phone Number
									</label>
									<Input readOnly={true} value={buyerData.phone} id="phone" className="rounded-none" />
								</Col>
							</Row>
							<Row justify={"space-between"} className="my-3">
								<Col xs={14} className="pr-1">
									<label className="font-semibold" htmlFor="favourite">
										Favourite
									</label>
									<Input readOnly={true} value={"buyerData.favourite"} id="favourite" className="rounded-none" />
								</Col>
								<Col xs={10}>
									<label className="font-semibold" htmlFor="group">
										Group
									</label>
									<Input readOnly={true} value={"buyerData.group"} id="group" className="rounded-none" />
								</Col>
							</Row>
							<Row justify={"space-between"} className="my-3">
								<label className="font-semibold" htmlFor="transactionHistory">
									Transaction History
								</label>
								<TextArea readOnly={true} value={"buyerData.transactionHistory"} id="transactionHistory" className="rounded-none" />
							</Row>
							<p className={`${buyerData.status === "Active" ? "text-blue-500" : "text-red-500"}`}>
								<span className="font-bold text-black">Status: </span>
								{buyerData.status}
							</p>
						</Modal>
					</ConfigProvider>
					<Modal
						title={`Confirm ${buyerData.status === "Active" ? "lock" : "unlock"} account`}
						open={isConfirmOpen}
						centered={true}
						width={600}
						onOk={() => {
							setIsConfirmOpen(false);
							setIsModalOpen(false);
						}}
						// confirmLoading={confirmLoading}
						onCancel={() => {
							setIsConfirmOpen(false);
						}}
					>
						<p className="text-base">
							Do you want to{" "}
							<span className={`${buyerData.status === "Active" ? "text-red-500" : "text-blue-500"} font-semibold`}>{buyerData.status === "Active" ? "lock" : "unlock"}</span> this
							account?
						</p>
					</Modal>
				</>
			)}
			{isMobile && (
				<>
					<h2 className="text-center text-3xl font-medium uppercase mb-4">Buyer List</h2>
					<ConfigProvider
						theme={{
							components: {
								Input: {
									colorPrimary: "var(--color-primary)",
									colorPrimaryHover: "var(--color-primary)",
									activeShadow: "0 0 0 2px rgba(34, 77, 49, 0.1)",
								},
								Button: {
									colorPrimary: "var(--color-primary)",
									colorPrimaryHover: "var(--color-primary)",
									activeShadow: "0 0 0 2px rgba(34, 77, 49, 0.1)",
								},
								Select: {
									colorPrimary: "var(--color-primary)",
									colorPrimaryHover: "var(--color-primary)",
								},
								Table: {},
							},
						}}
					>
						<Row justify={"space-between"}>
							{/* Search Component */}
							<Col xs={24} sm={14} className="flex">
								<Input className="h-full rounded-tr-none rounded-br-none py-2" />
								<Button className="h-full rounded-tl-none rounded-bl-none">
									<IoSearch className="text-lg z-0" />
								</Button>
							</Col>
							{/* Filter Component */}
							<Col xs={24} sm={8} className="flex items-center gap-3 mt-3">
								<span>Status: </span>
								<Select
									className="w-full rounded-none"
									size="large"
									defaultValue={"All"}
									options={[
										{
											value: "All",
											label: "All",
										},
										{
											value: "Active",
											label: "Active",
										},
										{
											value: "Inactive",
											label: "Inactive",
										},
									]}
								/>
							</Col>
						</Row>
					</ConfigProvider>
					{/* Table Component */}
					<table className="w-full my-4 border-l border-r border-b border-gray-300">
						<tbody>
							{data.map((buyer) => {
								// if (index >= (pageCurrent - 1) * 10 && index < pageCurrent * 10) {
								return (
									<tr
										className={`${index % 2 === 0 ? "bg-gray-200" : ""} border border-gray-400`}
										key={index}
										onClick={() => {
											setIsModalOpen(true);
											setBuyerData(buyer);
										}}
									>
										<td className="border-t border-gray-300 w-full flex">
											<div className="w-1/4 text-left pl-2 py-2 font-bold">Name</div>
											<div className="py-2">{buyer.fullName}</div>
										</td>
										<td className="border-t border-gray-300 w-full flex">
											<div className="w-1/4 text-left pl-2 py-2 font-bold">Age</div>
											<div className="py-2">{buyer.age}</div>
										</td>
										<td className="border-t border-gray-300 w-full flex">
											<div className="w-1/4 text-left pl-2 py-2 font-bold">Phone</div>
											<div className="py-2">{buyer.phone}</div>
										</td>
										<td className="border-t border-gray-300 w-full flex">
											<div className="w-1/4 text-left pl-2 py-2 font-bold">Email</div>
											<div className="py-2">{buyer.email}</div>
										</td>
										<td className="border-t border-t-gray-300 w-full flex">
											<div className="w-1/4 text-left pl-2 py-2 font-bold">Status</div>
											<div className="py-2">{buyer.status}</div>
										</td>
									</tr>
								);
								// }
							})}
						</tbody>
					</table>
					<Pagination align="center" total={data.length} onChange={onChangeTabMob} />
					<ConfigProvider
						theme={{
							components: {
								Input: {
									colorPrimary: "#d9d9d9",
									colorPrimaryHover: "#d9d9d9",
									activeShadow: "0 0 0 0px rgba(255, 255, 255, 0)",
								},
								Button: {
									colorPrimary: `${buyerData.status === "Active" ? "#f04544" : "#1677ff"}`,
									colorPrimaryHover: `${buyerData.status === "Active" ? "#f04544" : "#1677ff"}`,
								},
							},
						}}
					>
						{/* Modal Component */}
						<Modal
							className="buyer-detail-info"
							title="Buyer Information"
							open={isModalOpen}
							onCancel={() => setIsModalOpen(false)}
							onOk={() => {
								setIsConfirmOpen(true);
							}}
							okText={`${buyerData.status === "Active" ? "Inactive" : "Active"}`}
							centered={true}
						>
							<p className="italic text-center -mt-3">
								<span className="font-medium">Id:</span> {buyerData.id}
							</p>
							<Row justify={"space-between"} className="my-3">
								<Col xs={20} className="pr-1">
									<label className="font-semibold" htmlFor="name">
										Name
									</label>
									<Input readOnly={true} value={buyerData.fullName} id="name" className="rounded-none" />
								</Col>
								<Col xs={4}>
									<label className="font-semibold" htmlFor="age">
										Age
									</label>
									<Input readOnly={true} value={buyerData.age} id="age" className="rounded-none" />
								</Col>
							</Row>
							<Row justify={"space-between"} className="my-3">
								<Col xs={14} className="pr-1">
									<label className="font-semibold" htmlFor="email">
										Email
									</label>
									<Input readOnly={true} value={buyerData.email} id="email" className="rounded-none" />
								</Col>
								<Col xs={10}>
									<label className="font-semibold" htmlFor="password">
										Password
									</label>
									<Input.Password readOnly={true} value={buyerData.password} id="password" className="rounded-none" />
								</Col>
							</Row>
							<Row justify={"space-between"} className="my-3">
								<label className="font-semibold" htmlFor="address">
									Address
								</label>
								<Input readOnly={true} value={buyerData.address} id="address" className="rounded-none" />
							</Row>
							<Row justify={"space-between"} className="my-3">
								<Col xs={12} className="pr-1">
									<label className="font-semibold" htmlFor="career">
										Career
									</label>
									<Input readOnly={true} value={buyerData.career} id="career" className="rounded-none" />
								</Col>
								<Col xs={12}>
									<label className="font-semibold" htmlFor="phone">
										Phone Number
									</label>
									<Input readOnly={true} value={buyerData.phone} id="phone" className="rounded-none" />
								</Col>
							</Row>
							<Row justify={"space-between"} className="my-3">
								<Col xs={14} className="pr-1">
									<label className="font-semibold" htmlFor="favourite">
										Favourite
									</label>
									<Input readOnly={true} value={buyerData.favourite} id="favourite" className="rounded-none" />
								</Col>
								<Col xs={10}>
									<label className="font-semibold" htmlFor="group">
										Group
									</label>
									<Input readOnly={true} value={buyerData.group} id="group" className="rounded-none" />
								</Col>
							</Row>
							<Row justify={"space-between"} className="my-3">
								<label className="font-semibold" htmlFor="transactionHistory">
									Transaction History
								</label>
								<TextArea readOnly={true} value={buyerData.transactionHistory} id="transactionHistory" className="rounded-none" />
							</Row>
							<p className={`${buyerData.status === "Active" ? "text-blue-500" : "text-red-500"}`}>
								<span className="font-bold text-black">Status: </span>
								{buyerData.status}
							</p>
						</Modal>
					</ConfigProvider>
					<Modal
						title={`Confirm ${buyerData.status === "Active" ? "lock" : "unlock"} account`}
						open={isConfirmOpen}
						centered={true}
						width={600}
						onOk={() => {
							setIsConfirmOpen(false);
							setIsModalOpen(false);
						}}
						// confirmLoading={confirmLoading}
						onCancel={() => {
							setIsConfirmOpen(false);
						}}
					>
						<p className="text-base">
							Do you want to{" "}
							<span className={`${buyerData.status === "Active" ? "text-red-500" : "text-blue-500"} font-semibold`}>{buyerData.status === "Active" ? "lock" : "unlock"}</span> this
							account?
						</p>
					</Modal>
				</>
			)}
		</div>
	);
};
export default ManagerBuyerList;
