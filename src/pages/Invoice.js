import React, { useRef, useState, useEffect } from "react";
import { Card, Form, Input, Button, Row, Col, Table, Select } from "antd";
import "./Invoice.css";
import moment from "moment";
import { PrinterOutlined, DownloadOutlined } from "@ant-design/icons";
import ReactToPrint from "react-to-print";
import { useLocation } from "react-router-dom";
import image from '../components/img.png';

const { Option } = Select;

const Invoice = (props) => {
    const [form] = Form.useForm();
    const location = useLocation();
    const invoiceData = location.state;
    const { bookingId, groupId, booking } = location.state || {};
    const componentRef = useRef();
    const { billingSummary } = location.state;

    const [roomServiceBill, setRoomServiceBill] = useState(Number(0));
    const [extraGuestCharges, setExtraGuestCharges] = useState(Number(0));
    const [title, setTitle] = useState("");
    const [date, setDate] = useState(moment().format("YYYY-MM-DD"));
    const [name, setName] = useState(invoiceData?.customerName || "");
    const [company, setCompany] = useState("");
    const [gst, setGst] = useState("");
    const [invoiceNumber, setInvoiceNumber] = useState("");


    const formatAmount = (amount) => {
        if (amount === 0 || amount === '0' || amount === '0.00') {
            return '';
        }
        return Number(amount).toFixed(2);
    };

    // Function to format time
    const formatTime = (time) => {
        if (!time) return '';
        return moment(time, 'HH:mm:ss').format('hh:mm A');
    };


    useEffect(() => {
        console.log('Invoice Data:', invoiceData);
        console.log('Booking Data:', booking);

        // Set initial values
        setName(invoiceData?.customerName || "");
        setInvoiceNumber(invoiceData?.invoiceNumber || "");

        // Fetch invoice number if not available
        if (!invoiceData?.invoiceNumber) {
            fetchInvoiceNumber();
        }
    }, [invoiceData, booking]);

    useEffect(() => {
        form.setFieldsValue({
            roomServiceBill: roomServiceBill,
            extraGuestCharges: extraGuestCharges,
            date: date,
            name: name,
            company: company,
            taxId: gst,
            invoiceId: invoiceNumber,
        });
    }, [roomServiceBill, extraGuestCharges, date, name, company, gst, invoiceNumber, form]);

    const fetchInvoiceNumber = async () => {
        const gstNumber = form.getFieldValue('taxId');
        const url = groupId
            ? `http://ec2-54-211-23-206.compute-1.amazonaws.com:8081/invoice/generateForGroup?groupId=${groupId}`
            : `http://ec2-54-211-23-206.compute-1.amazonaws.com:8081/invoice/generate?bookingId=${bookingId}`;

        try {
            const response = await fetch(url + (gstNumber ? `&gstNumber=${gstNumber}` : ''), {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${props.authToken}`,
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            setInvoiceNumber(data.invoiceNumber);
        } catch (error) {
            console.error("Failed to fetch invoice number: ", error);
        }
    };

    const handleDateChange = (e) => {
        setDate(e.target.value);
    };

    const handleNameChange = (e) => {
        setName(e.target.value);
    };

    const handleCompanyChange = (e) => {
        setCompany(e.target.value);
    };

    const handleGstChange = (e) => {
        setGst(e.target.value);
    };

    const calculateTotalAmount = () => {
        const roomCharges = Number(invoiceData.billingSummary.roomCharges) || 0;
        const addOnCharges = Number(invoiceData.billingSummary.addOnCharges) || 0;
        const cgst = Number(invoiceData.billingSummary.cgst) || 0;
        const sgst = Number(invoiceData.billingSummary.sgst) || 0;
        const discount = Number(invoiceData?.discount) || Number(location?.state?.bookingDetails?.discount) || 0;
        const foodBill = Number(invoiceData.billingSummary.foodBill) || 0;

        return roomCharges + roomServiceBill + addOnCharges + extraGuestCharges + cgst + sgst - discount + foodBill;
    };

    const grandTotal = calculateTotalAmount();

    const tableData = [
        { key: 1, description: 'Lodging Rent', SAC: 996311, rupees: Number(invoiceData.billingSummary.roomCharges).toFixed(2) },
        { key: 2, description: 'Restaurant Bill', SAC: 996331, rupees: Number(invoiceData.billingSummary.foodBill).toFixed(2) },
        { key: 3, description: 'Room Service Bill', SAC: 996331, rupees: roomServiceBill.toFixed(2) },
        { key: 4, description: 'Additional Charges', SAC: 996311, rupees: Number(invoiceData.billingSummary.addOnCharges).toFixed(2) },
        { key: 5, description: 'Extra Guest Charges', SAC: 996311, rupees: extraGuestCharges.toFixed(2) },
        { key: 6, description: 'Discount', SAC: '', rupees: (Number(invoiceData?.discount) || Number(location?.state?.bookingDetails?.discount) || 0).toFixed(2) },
        { key: 7, description: 'CGST 6%', SAC: '', rupees: Number(billingSummary.cgst).toFixed(2) },
        { key: 8, description: 'SGST 6%', SAC: '', rupees: Number(billingSummary.sgst).toFixed(2) },
    ];

    return (
        <div style={{ padding: "20px" }}>
            <Row gutter={16}>
                <Col span={12}>
                    <Card title="Create New Invoice" bordered={false} style={{ minHeight: "100%" }}>
                        <Form form={form} layout="vertical" initialValues={invoiceData}>
                            <Row gutter={16}>
                                <Col span={12}>
                                    <Form.Item name="date" label="Date">
                                        <Input type="date" onChange={handleDateChange} value={date} />
                                    </Form.Item>
                                </Col>
                            </Row>
                            <Row gutter={16}>
                                <Col span={12}>
                                    <Form.Item name="customerName" label="Name" initialValue={name}>
                                        <Input onChange={handleNameChange} />
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item name="title" label="Title">
                                        <Select placeholder="Select a title" style={{ width: 120 }} onChange={setTitle}>
                                            <Option value="" disabled>Select a title</Option>
                                            <Option value="Mr.">Mr.</Option>
                                            <Option value="Miss">Miss</Option>
                                            <Option value="Mrs.">Mrs.</Option>
                                        </Select>
                                    </Form.Item>
                                </Col>
                            </Row>
                            <Row gutter={16}>
                                <Col span={12}>
                                    <Form.Item name="company" label="Company">
                                        <Input onChange={handleCompanyChange} />
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item name="taxId" label="GST">
                                        <Input onChange={handleGstChange} />
                                    </Form.Item>
                                </Col>
                            </Row>
                        </Form>
                    </Card>
                </Col>
                <Col span={12}>
                    <Card bordered={false} style={{ padding: "24px", border: "1px solid #f0f0f0", borderRadius: "4px", background: "#fff" }}>
                        <div ref={componentRef} className="invoice-container">
                            <header className="invoice-header">
                                <div className="gst-contact">
                                    <span>
                                        <strong>GST No.</strong> 27AAAFH8882F1ZB
                                    </span>
                                    <span>
                                        <strong>Date:</strong> {date}
                                    </span>
                                </div>
                                <b>TAX INVOICE</b>
                                <Col style={{
                                    display: "flex",
                                    justifyContent: "center",
                                    alignItems: "center",
                                }}>
                                    <img
                                        src={image}
                                        alt="Hotel Madhuban Logo"
                                        style={{ width: "190px", marginBottom: "2px" }}
                                    />
                                </Col>
                                <div className="invoice-date-number" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                    <div style={{ display: 'flex' }}>
                                        <span>
                                            <strong>INVOICE No.:</strong> {invoiceNumber}
                                        </span>
                                    </div>
                                    <div></div>
                                    <div style={{ display: 'flex', alignItems: 'center' }}>
                                        <span>
                                            <label>Name:</label> {title} {name}&nbsp;&nbsp;&nbsp;
                                        </span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center' }}>
                                        <span>
                                            <label>Room No:</label> {invoiceData.roomNumber || ''}&nbsp;&nbsp;&nbsp;
                                        </span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        <span>
                                            <label>Company:</label> {company}&nbsp;&nbsp;&nbsp;
                                        </span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center' }}>
                                        <span>
                                            <label>GST:</label> {gst}&nbsp;&nbsp;&nbsp;
                                        </span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center' }}>
                                        <span>
                                            <label>Arrival Date:</label> {invoiceData.checkIn} &nbsp;&nbsp;&nbsp;
                                        </span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center' }}>
                                        <span>
                                            <label>Arrival Time:</label> {location.state.checkInTime}&nbsp;&nbsp;&nbsp;
                                        </span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center' }}>
                                        <span>
                                            <label>Departure Date:</label> {invoiceData.checkOut} &nbsp;&nbsp;&nbsp;
                                        </span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center' }}>
                                        <span>
                                            <label>Departure Time:</label> {location.state.checkOutTime}&nbsp;&nbsp;&nbsp;
                                        </span>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', paddingTop: '10px' }}>
                                    <span>
                                        <label>Tariff:</label> {form.getFieldValue("tariff")}&nbsp;&nbsp;&nbsp;
                                    </span>
                                </div>
                            </header>
                            <Table
                                dataSource={tableData}
                                pagination={false}
                                bordered
                                size="small"
                            >
                                <Table.Column title="Description" dataIndex="description" key="description" width={200}
                                    render={(text, record) => {
                                        if (record.key === 7 || record.key === 8) {
                                            return {
                                                children: text,
                                                props: { colSpan: 2 }
                                            };
                                        }
                                        return text;
                                    }}
                                />
                                <Table.Column title="SAC" dataIndex="SAC" key="SAC" width={80}
                                    render={(text, record) => {
                                        if (record.key === 7 || record.key === 8) {
                                            return {
                                                props: { colSpan: 0 }
                                            };
                                        }
                                        return text;
                                    }}
                                />
                                <Table.Column
                                    title="Rupees"
                                    dataIndex="rupees"
                                    key="rupees"
                                    render={(text) => formatAmount(text) ? `₹${formatAmount(text)}` : ''}
                                    width={80}
                                />
                                <Table.Column
                                    title="Ps"
                                    key="Ps"
                                    width={30}
                                />
                            </Table>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
                                <strong>Total: ₹{grandTotal.toFixed(2)}</strong>
                            </div>
                            <footer className="invoice-footer">
                                <div className="signature">
                                    <span style={{ textAlign: 'left' }}>Guest Signature</span>
                                    <span style={{ textAlign: 'right', position: 'relative', right: '180px' }}>Receptionist</span>
                                </div>
                            </footer>
                            <br />
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span>Ch. Shivaji Maharaj Circle, Jalna (MH) 431203 </span>
                                <span>  Mobile: +91 8265065418</span>
                            </div>
                        </div>
                        <div style={{ marginTop: "20px", textAlign: "center" }}>
                            <ReactToPrint
                                trigger={() => (
                                    <Button icon={<PrinterOutlined />} className="no-print" />
                                )}
                                content={() => componentRef.current}
                            />
                            <Button
                                icon={<DownloadOutlined />}
                                onClick={() => { }}
                                style={{ marginLeft: 8 }}
                                className="no-print"
                            />
                        </div>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default Invoice;