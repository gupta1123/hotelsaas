import React, { useState, useEffect } from "react";
import { Card, Form, Input, DatePicker, Select, Space, message, List, Button, Typography } from "antd";
import { DeleteOutlined, EditOutlined, CloseOutlined, PlusOutlined } from "@ant-design/icons";
import moment from "moment";

const { Title, Text } = Typography;
const { Option } = Select;

const GroupAddTransactions = ({ groupId, authToken, onTransactionsUpdated }) => {
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);
    const [showForm, setShowForm] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [transactions, setTransactions] = useState([]);
    const [selectedTransaction, setSelectedTransaction] = useState(null);
    const [form] = Form.useForm();

    useEffect(() => {
        fetchTransactions();
    }, [groupId, authToken]);

    useEffect(() => {
        const handleResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const fetchTransactions = async () => {
        if (!groupId || !authToken) {
            console.error("groupId or authToken is missing");
            return;
        }

        try {
            const response = await fetch(`http://ec2-54-211-23-206.compute-1.amazonaws.com:8081/billing/getAllGroupTransactions?groupId=${groupId}`, {
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error('Failed to fetch transactions');
            }

            const data = await response.json();
            setTransactions(data);
            onTransactionsUpdated(data);
        } catch (error) {
            console.error("Error fetching transactions:", error);
            // Avoid showing error when adding a transaction but log it
        }
    };


    const handleAddTransactionClick = () => {
        setShowForm(true);
        setEditMode(false);
        setSelectedTransaction(null);
        form.resetFields();
        form.setFieldsValue({
            paymentMode: "online",
            date: moment(),
        });
    };
    const handleEditTransactionClick = (transaction) => {
        setShowForm(true);
        setEditMode(true);
        setSelectedTransaction(transaction);

        form.setFieldsValue({
            date: moment(transaction.date),
            amountPaid: transaction.amountPaid.toString(),
            paymentMode: transaction.paymentMode,
        });
    };

    const handleCancelClick = () => {
        setShowForm(false);
        setEditMode(false);
        setSelectedTransaction(null);
        form.resetFields();
    };

    const handleFormSubmit = async (values) => {
        if (editMode && selectedTransaction) {
            await editGroupTransaction(values, selectedTransaction.transactionId); // Pass the transactionId to the edit function
        } else {
            await addGroupTransaction(values);
        }
    };

    const editGroupTransaction = async (values, transactionId) => {
        // Use transactionId argument instead of trying to access it from selectedTransaction directly
        const payload = {
            ...values,
            amountPaid: parseFloat(values.amountPaid),
            groupId,
            transactionId: transactionId,
            date: values.date.format("YYYY-MM-DD"),
        };

        try {
            const response = await fetch(`http://ec2-54-211-23-206.compute-1.amazonaws.com:8081/transaction/editForGroup?groupId=${groupId}&transactionId=${transactionId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    'Authorization': `Bearer ${authToken}`
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP error! status: ${response.status}, ${errorText}`);
            }

            message.success("Group Transaction Updated!");
            fetchTransactions();
            setShowForm(false);
            setEditMode(false);
            setSelectedTransaction(null);
        } catch (error) {
            console.error("Error updating transaction:", error);
            message.error("Error updating transaction.");
        }
    };

    const addGroupTransaction = async (values) => {
        const payload = {
            amountPaid: parseFloat(values.amountPaid),
            paymentMode: values.paymentMode,
            groupId,
            date: values.date.format("YYYY-MM-DD"),
        };

        try {
            const response = await fetch("http://ec2-54-211-23-206.compute-1.amazonaws.com:8081/transaction/createForGroup", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    'Authorization': `Bearer ${authToken}`
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP error! status: ${response.status}, ${errorText}`);
            }

            message.success("Transaction added successfully!");
            // Fetch transactions again to update the list
            fetchTransactions();
            setShowForm(false); // Close the form upon successful addition
        } catch (error) {
            console.error("Error making API call:", error);
            message.error("Failed to add transaction.");
        }
    };
    const deleteTransaction = async (transactionId) => {
        try {
            await fetch(`http://ec2-54-211-23-206.compute-1.amazonaws.com:8081/transaction/deleteFromGroup?transactionId=${transactionId}&groupId=${groupId}`, {
                method: "DELETE",
                headers: { 'Authorization': `Bearer ${authToken}` },
            });
            message.success("Transaction deleted successfully.");
            fetchTransactions(); // Refresh the list
        } catch (error) {
            console.error("Error deleting transaction:", error);
            message.error("Failed to delete transaction.");
        }
    };

    const responsiveStyle = {
        ...styles.transactionCard,
        width: windowWidth < 768 ? "100%" : "90%",
        margin: windowWidth < 480 ? "10px 0" : "20px auto",
    };
    return (
        <Card style={responsiveStyle}>
            <div style={styles.headerContainer}>
                <Title level={4} style={styles.headerTitle}>
                    Transactions
                </Title>
                <Button style={styles.addButton} onClick={handleAddTransactionClick}>
                    <PlusOutlined /> Add Transaction
                </Button>
            </div>

            {showForm && (
                <Form form={form} layout="vertical" style={styles.transactionForm} onFinish={handleFormSubmit}>
                    <div style={{ display: "flex", flexWrap: "wrap" }}>
                        <Form.Item
                            name="date"
                            label="Date"
                            rules={[{ required: true, message: "Please select date!" }]}
                            style={{ flex: 1, marginRight: 16, marginBottom: 16 }}
                        >
                            <DatePicker />
                        </Form.Item>
                        <Form.Item
                            name="amountPaid"
                            label="Amount"

                            rules={[{ required: true, message: "Please input amount!" }]}
                            style={{ flex: 1, marginRight: 16, marginBottom: 16 }}
                        >
                            <Input prefix="₹" type="number" min={0}
                            />
                        </Form.Item>
                        <Form.Item
                            name="paymentMode"
                            label="Payment Method"
                            style={{ flex: 1, marginRight: 16, marginBottom: 16 }}
                        >
                            <Select defaultValue="online">
                                <Option value="online">Online</Option>
                                <Option value="cash">Cash</Option>
                                <Option value="creditCard">Credit Card</Option>
                                <Option value="upi">UPI</Option>
                            </Select>
                        </Form.Item>
                    </div>
                    <Space>
                        <Button type="primary" htmlType="submit">
                            {editMode ? "Update" : "Save"}
                        </Button>
                        <Button onClick={handleCancelClick}>
                            <CloseOutlined /> Cancel
                        </Button>
                    </Space>
                </Form>
            )}

            <List
                itemLayout="horizontal"
                dataSource={transactions}
                renderItem={(item) => (
                    <Card key={item.transactionId} style={styles.transactionListItem}>
                        <div style={styles.transactionDetails}>
                            <Text style={styles.transactionId}>Transaction #{item.transactionId}</Text>
                            <Text style={styles.transactionText}>
                            🗓️: {moment(item.date).format("YYYY-MM-DD")} | 💵: ₹{item.amountPaid} | 💳: {item.paymentMode}
                            </Text>
                            <div style={styles.actionButtons}>
                                <Button
                                    icon={<EditOutlined />}
                                    onClick={() => handleEditTransactionClick(item)}
                                    style={styles.editButton}
                                />
                                <Button
                                    icon={<DeleteOutlined />}
                                    onClick={() => deleteTransaction(item.transactionId)}
                                    style={styles.deleteButton}
                                />
                            </div>
                        </div>
                    </Card>
                )}
            />
        </Card>
    );
};
const styles = {
    transactionCard: {
        maxWidth: "100%",
        width: "825px",
        backgroundColor: "#FFFFFF",
        borderRadius: 10,
        boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
    },
    headerContainer: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 20,
    },
    headerTitle: {
        margin: 0,
    },
    addButton: {
        backgroundColor: "#4CAF50",
        color: "white",
        border: "none",
        borderRadius: 5,
    },
    transactionForm: {
        marginBottom: 20,
    },
    transactionListItem: {
        backgroundColor: "#f5f5f5",
        margin: "10px 0",
        borderRadius: 5,
        boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
    },
    transactionDetails: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "12px 24px",
    },
    transactionId: {
        margin: 0,
        color: "#333333",
        fontWeight: "bold",
    },
    transactionText: {
        margin: 0,
        color: "#333333",
    },
    actionButtons: {
        display: "flex",
        alignItems: "center",
    },
    editButton: {
        backgroundColor: "#2196F3",
        color: "white",
        border: "none",
        marginRight: 8,
    },
    deleteButton: {
        backgroundColor: "#F44336",
        color: "white",
        border: "none",
    },
};

export default GroupAddTransactions;