import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useHistory } from 'react-router-dom';
import {
    Box, VStack, HStack, Text, Heading, Button, Icon, Flex, Spacer,
    useColorModeValue, Spinner, Divider, Badge, Modal, ModalOverlay, NumberInputStepper, AlertDialog, AlertDialogOverlay, NumberIncrementStepper,
    ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton, NumberInput, NumberInputField, InputGroup, InputLeftElement, IconButton, Th, Tr, Tbody, NumberDecrementStepper,
    Input, Grid, Checkbox, useToast, useDisclosure, Td, SimpleGrid, AlertDialogContent, AlertDialogHeader, AlertDialogBody, AlertDialogFooter, Table, Thead,
} from '@chakra-ui/react';
import {
    CalendarIcon, CheckCircleIcon, InfoIcon, PhoneIcon,
    MoonIcon, AddIcon, ArrowBackIcon, DownloadIcon, EditIcon, RepeatIcon,
} from '@chakra-ui/icons';
import { FaHotel, FaMoneyBillWave, FaEllipsisV, FaUser, FaWallet } from 'react-icons/fa';
import GroupAddTransactions from '../modals/GroupAddTransactions';
import UnifiedTransactionComponent from '../modals/UnifiedTransactionComponent';
import { FaBed, FaCalendarAlt } from 'react-icons/fa';
import { BsBoxArrowInLeft, BsBoxArrowRight } from 'react-icons/bs'
import { MdHotel, MdAddCircle } from 'react-icons/md';
import { FaUtensils, FaPercent, FaExclamationCircle } from 'react-icons/fa';
import { FaPhone, FaMoon, FaEnvelope, FaMapMarkerAlt } from 'react-icons/fa';
import { format } from 'date-fns';
import moment from 'moment';
import { SearchIcon } from '@chakra-ui/icons';
import { DateRangePicker } from 'react-date-range';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
//import { Select } from "chakra-react-select";

import styled from "styled-components";

const FormControl = styled.div`
  margin-top: 16px;
  display: flex;
  flex-direction: column;
`;

const FormLabel = styled.label`
  margin-bottom: 8px;
  font-size: 1rem;
  font-weight: bold;
  color: #333;
`;

const Select = styled.select`
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  background-color: #fff;
  transition: border-color 0.2s;

  &:hover {
    border-color: #999;
  }

  &:focus {
    border-color: #007bff;
    box-shadow: 0 0 0 1px #007bff;
    outline: none;
  }
`;


const CombinedSettlementPage = ({ authToken }) => {
    const location = useLocation();
    const history = useHistory();
    const toast = useToast();
    const [bookingData, setBookingData] = useState(null);
    const [groupData, setGroupData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isCheckoutModalVisible, setIsCheckoutModalVisible] = useState(false);
    const [isAddTransactionModalVisible, setIsAddTransactionModalVisible] = useState(false);
    const [foodBillAmount, setFoodBillAmount] = useState(0);
    const { customerId, groupId, discount } = location.state || {};
    const [selectedRooms, setSelectedRooms] = useState([]);
    const [isMultiplePaymentModalOpen, setIsMultiplePaymentModalOpen] = useState(false);
    const [bookingsForSelection, setBookingsForSelection] = useState([]);
    const [selectedBookings, setSelectedBookings] = useState([]);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [addOnPrices, setAddOnPrices] = useState({ mattress: 0, breakfast: 0 });
    const [transactions, setTransactions] = useState([]);
    const [isCombinedBillModalOpen, setIsCombinedBillModalOpen] = useState(false);
    const [combinedBillDetails, setCombinedBillDetails] = useState(null);
    const formatAmount = (amount) => Math.round(amount).toLocaleString('en-IN');
    const [refreshFlag, setRefreshFlag] = useState(false); // Add this state
    const [checincheckout, setCheckincheckout] = useState([])
    const [paymentModalData, setPaymentModalData] = useState({ bookingIds: [], totalAmount: 0 });
    const [paymentSummary, setPaymentSummary] = useState({
        totalRoomTariff: 0,
        totalAddons: 0,
        totalFoodAmount: 0,
        totalGST: 0,
        totalGrossTotal: 0,
        totalPendingAmt: 0,
    });

    const [billingSummary, setBillingSummary] = useState({
        roomCharges: 0,
        addOnCharges: 0,
        foodBill: 0,
        discount: 0,
        offerDiscount: 0,
        gstAmount: 0,
        subtotal: 0,
        grossAmount: 0,
        amountPaid: 0,
        amountPending: 0
    });

    const [previousBookingData, setPreviousBookingData] = useState(null);
    const [previousGroupData, setPreviousGroupData] = useState(null);

    const isGroupBooking = !!groupId;

    useEffect(() => {
        fetchBookingData();
        console.log('customerId:', customerId);
        console.log('groupId:', groupId);
        console.log('billingSummary', location.state.billingSummary);
    }, [customerId, groupId, authToken]);


    useEffect(() => {
        fetchBookingData();
        console.log('billingSummary', location.state.billingSummary)
    }, [customerId, groupId, authToken]);

    const calculatePaymentSummary = useCallback((bookings, currentTransactions) => {
        console.log('currentTransactions', currentTransactions);
        console.log('bookings', bookings);

        const calculateTotal = (key) => {
            return bookings.reduce((total, booking) => total + (booking[key] || 0), 0);
        };

        let roomCharges = calculateTotal('roomTotal');
        let addOnCharges = 0;

        bookings.forEach(booking => {
            const days = moment(booking.checkOut).diff(moment(booking.checkIn), 'days');
            // Add breakfast cost to room charges
            roomCharges += (booking.addOnMap?.breakfast || 0) * addOnPrices.breakfast ;
            // Calculate mattress cost as add-on charges
            addOnCharges += (booking.addOnMap?.mattress || 0) * addOnPrices.mattress;
        });

        const foodBill = calculateTotal('foodAmount');
        const discount = calculateTotal('discount');
        const offerDiscount = calculateTotal('offerDiscount') || 0;
        const gstAmount = calculateTotal('gstAmount');

        const subtotal = roomCharges + addOnCharges + foodBill - discount - offerDiscount;
        const grossAmount = subtotal + gstAmount;

        // Use the paidAmt from the booking data instead of calculating from transactions
        const amountPaid = calculateTotal('paidAmt');

        const summary = {
            totalRoomTariff: roomCharges,
            totalAddons: addOnCharges,
            totalFoodAmount: foodBill,
            totalGST: gstAmount,
            totalGrossTotal: grossAmount,
            totalPendingAmt: grossAmount - amountPaid,
        };

        console.log('gst', gstAmount)
        setBillingSummary({
            roomCharges,
            addOnCharges,
            foodBill,
            discount,
            offerDiscount,
            gstAmount,
            subtotal,
            grossAmount,
            amountPaid,
            amountPending: grossAmount - amountPaid
        });

        return summary;
    }, [addOnPrices]);


    useEffect(() => {
        if (isGroupBooking && groupData) {
            setPaymentSummary(calculatePaymentSummary(groupData, transactions));
        } else if (!isGroupBooking && bookingData) {
            setPaymentSummary(calculatePaymentSummary([bookingData], transactions));
        }
    }, [groupData, bookingData, addOnPrices, transactions, isGroupBooking, calculatePaymentSummary]);

    // const fetchBookingData = useCallback(async () => {
    //     setLoading(true);
    //     try {
    //         const url = isGroupBooking
    //             ? `http://ec2-54-211-23-206.compute-1.amazonaws.com:8081/reservation/getGroupSummary?groupId=${groupId}`
    //             : `http://ec2-54-211-23-206.compute-1.amazonaws.com:8081/reservation/getSummary?bookingId=${customerId}`;
    //         const response = await fetch(url, {
    //             headers: {
    //                 Authorization: `Bearer ${authToken}`,
    //             },
    //         });
    //         if (!response.ok) {
    //             throw new Error('Failed to fetch booking data');
    //         }
    //         const data = await response.json();

    //         if (isGroupBooking) {
    //             setGroupData(data);
    //             setCheckincheckout(data);
    //             setPreviousGroupData(data);
    //         } else {
    //             setBookingData(data);
    //             setCheckincheckout(data);
    //             setPreviousBookingData(data);
    //         }

    //         // Fetch latest transactions
    //         const transactionsUrl = isGroupBooking
    //             ? `http://ec2-54-211-23-206.compute-1.amazonaws.com:8081/billing/getAllGroupTransactions?groupId=${groupId}`
    //             : `http://ec2-54-211-23-206.compute-1.amazonaws.com:8081/billing/getAllTransactions?bookingId=${customerId}`;
    //         const transactionsResponse = await fetch(transactionsUrl, {
    //             headers: { 'Authorization': `Bearer ${authToken}` }
    //         });
    //         const transactionsData = await transactionsResponse.json();
    //         setTransactions(transactionsData);

    //         // Calculate and set new payment summary
    //         const newSummary = calculatePaymentSummary(isGroupBooking ? data : [data], transactionsData);
    //         setPaymentSummary(newSummary);
    //     } catch (error) {
    //         console.error('Error fetching booking data:', error);
    //         toast({
    //             title: 'Error',
    //             description: `Failed to fetch booking data: ${error.message}`,
    //             status: 'error',
    //             duration: 5000,
    //             isClosable: true,
    //         });
    //     } finally {
    //         setLoading(false);
    //     }
    // }, [authToken, isGroupBooking, groupId, customerId, calculatePaymentSummary, toast]);
    const calculateBillingSummary = useCallback((bookings) => {
        //if (!bookings.length) return;
        console.log('Calculating Billing Summary with Bookings data:', bookings);
        console.log('booking data length', bookings);

        // Use let for variables that might be reassigned
        let roomCharges = bookings[0].roomTotal;
        let addOnCharges = bookings[0].addOnTotal;
        let foodBill = bookings[0].foodAmount;
        let discount = bookings[0].discount;
        let offerDiscount = bookings[0].offerDiscount || 0;
        let gstAmount = bookings[0].gstAmount;
        let grossAmount = bookings[0].grossTotal;
        let amountPaid = bookings[0].paidAmt;
        let amountPending = bookings[0].pendingAmt;

        // Calculated values
        let subtotal = roomCharges + addOnCharges + foodBill - discount - offerDiscount;
        let cgst = gstAmount / 2;
        let sgst = gstAmount / 2;

        // For group bookings, sum up values from all bookings
        if (bookings.length > 1) {
            const calculateTotal = (key) => bookings.reduce((total, booking) => total + (booking[key] || 0), 0);

            roomCharges = calculateTotal('roomTotal');
            addOnCharges = calculateTotal('addOnTotal');
            foodBill = calculateTotal('foodAmount');
            discount = calculateTotal('discount');
            offerDiscount = calculateTotal('offerDiscount') || 0;
            gstAmount = calculateTotal('gstAmount');
            grossAmount = calculateTotal('grossTotal');
            amountPaid = calculateTotal('paidAmt');
            amountPending = calculateTotal('pendingAmt');

            subtotal = roomCharges + addOnCharges + foodBill - discount - offerDiscount;
            cgst = gstAmount / 2;
            sgst = gstAmount / 2;
        }

        console.log('Updated Billing Summary:', {
            roomCharges,
            addOnCharges,
            foodBill,
            discount,
            offerDiscount,
            gstAmount,
            subtotal,
            grossAmount,
            amountPaid,
            amountPending,
            cgst,
            sgst
        });

        setBillingSummary({
            roomCharges,
            addOnCharges,
            foodBill,
            discount,
            offerDiscount,
            gstAmount,
            subtotal,
            grossAmount,
            amountPaid,
            amountPending,
            cgst,
            sgst
        });
    }, []);

    const fetchBookingData = useCallback(async () => {
        setLoading(true);
        try {
            let url;
            if (customerId) {
                url = `http://ec2-54-211-23-206.compute-1.amazonaws.com:8081/reservation/getSummary?bookingId=${customerId}`;
            } else if (groupId) {
                url = `http://ec2-54-211-23-206.compute-1.amazonaws.com:8081/reservation/getGroupSummary?groupId=${groupId}`;
            } else {
                throw new Error('Either customerId or groupId must be provided');
            }

            const response = await fetch(url, {
                headers: {
                    Authorization: `Bearer ${authToken}`,
                },
            });
            if (!response.ok) {
                throw new Error('Failed to fetch booking data');
            }
            const data = await response.json();
            console.log('API Response combined settlement:', data);

            if (customerId) {
                setBookingData(data);
                setCheckincheckout(data);
                setPreviousBookingData(data);
            } else if (groupId) {
                setGroupData(data);
                setCheckincheckout(data);
                setPreviousGroupData(data);
            }

            // Calculate and update payment summary
            const bookings = customerId ? [data] : data;
            const summary = calculateBillingSummary(bookings);
            setPaymentSummary(summary);

            console.log('paymentSummary', paymentSummary)
            // Fetch latest transactions
            const transactionsUrl = customerId
                ? `http://ec2-54-211-23-206.compute-1.amazonaws.com:8081/billing/getAllTransactions?bookingId=${customerId}`
                : `http://ec2-54-211-23-206.compute-1.amazonaws.com:8081/billing/getAllGroupTransactions?groupId=${groupId}`;
            const transactionsResponse = await fetch(transactionsUrl, {
                headers: { 'Authorization': `Bearer ${authToken}` }
            });
            const transactionsData = await transactionsResponse.json();
            setTransactions(transactionsData);
        } catch (error) {
            console.error('Error fetching booking data:', error);
            toast({
                title: 'Error',
                description: `Failed to fetch booking data: ${error.message}`,
                status: 'error',
                duration: 5000,
                isClosable: true,
            });
        } finally {
            setLoading(false);
        }
    }, [authToken, customerId, groupId, calculateBillingSummary, toast]);

    const handleTransactionsUpdated = useCallback(() => {
        fetchBookingData().then(() => calculateBillingSummary());
    }, [fetchBookingData, calculateBillingSummary]);


    useEffect(() => {
        if (isGroupBooking && groupData) {
            setPaymentSummary(calculatePaymentSummary(groupData, transactions));
        } else if (!isGroupBooking && bookingData) {
            setPaymentSummary(calculatePaymentSummary([bookingData], transactions));
        }
    }, [groupData, bookingData, addOnPrices, transactions, isGroupBooking, calculatePaymentSummary]);



    useEffect(() => {
        const fetchAddOnPrices = async () => {
            try {
                const response = await fetch('http://ec2-54-211-23-206.compute-1.amazonaws.com:8081/addOns/getAll', {
                    headers: { 'Authorization': `Bearer ${authToken}` }
                });
                const data = await response.json();
                const prices = {};
                data.forEach(item => prices[item.name.toLowerCase()] = item.cost);
                setAddOnPrices(prices);
            } catch (error) {
                console.error('Error fetching add-on prices:', error);
            }
        };

        fetchAddOnPrices();
    }, [authToken]);

    useEffect(() => {
        const fetchTransactions = async () => {
            try {
                const url = isGroupBooking
                    ? `http://ec2-54-211-23-206.compute-1.amazonaws.com:8081/billing/getAllGroupTransactions?groupId=${groupId}`
                    : `http://ec2-54-211-23-206.compute-1.amazonaws.com:8081/billing/getAllTransactions?bookingId=${customerId}`;

                const response = await fetch(url, {
                    headers: { 'Authorization': `Bearer ${authToken}` }
                });
                const data = await response.json();
                setTransactions(data);
            } catch (error) {
                console.error('Error fetching transactions:', error);
            }
        };

        fetchTransactions();
    }, [isGroupBooking, groupId, customerId, authToken]);

    useEffect(() => {
        if (groupData && groupData.length > 0) {
            const calculateTotal = (key) => {
                return groupData.reduce((total, booking) => total + (booking[key] || 0), 0);
            };

            const calculateAddOnTotal = () => {
                return groupData.reduce((total, booking) => {
                    const days = moment(booking.checkOut).diff(moment(booking.checkIn), 'days');
                    const mattressCost = (booking.addOnMap?.mattress || 0) * addOnPrices.mattress * days;
                    return total + mattressCost;
                }, 0);
            };

            const roomCharges = calculateTotal('roomTotal') + groupData.reduce((total, booking) => {
                const days = moment(booking.checkOut).diff(moment(booking.checkIn), 'days');
                return total + (booking.addOnMap?.breakfast || 0) * addOnPrices.breakfast * days;
            }, 0);

            const addOnCharges = calculateAddOnTotal();
            const foodBill = calculateTotal('foodAmount');
            const discount = calculateTotal('discount');
            const offerDiscount = calculateTotal('offerDiscount') || 0;
            const gstAmount = calculateTotal('gstAmount');

            const subtotal = roomCharges + addOnCharges + foodBill - discount - offerDiscount;
            const grossAmount = subtotal + gstAmount;

            setPaymentSummary({
                totalRoomTariff: roomCharges,
                totalAddons: addOnCharges,
                totalFoodAmount: foodBill,
                totalGST: gstAmount,
                totalGrossTotal: grossAmount,
                totalPendingAmt: grossAmount - calculateTotal('paidAmt'),
            });
        }
    }, [groupData, addOnPrices]);

    useEffect(() => {
        const calculateSummary = (bookings) => {
            const calculateTotal = (key) => {
                return bookings.reduce((total, booking) => total + (booking[key] || 0), 0);
            };

            const calculateAddOnTotal = () => {
                return bookings.reduce((total, booking) => {
                    const days = moment(booking.checkOut).diff(moment(booking.checkIn), 'days');
                    const mattressCost = (booking.addOnMap?.mattress || 0) * addOnPrices.mattress;
                    return total + mattressCost;
                }, 0);
            };

            const roomCharges = calculateTotal('roomTotal') + bookings.reduce((total, booking) => {
                const days = moment(booking.checkOut).diff(moment(booking.checkIn), 'days');
                return total + (booking.addOnMap?.breakfast || 0) * addOnPrices.breakfast ;
            }, 0);

            const addOnCharges = calculateAddOnTotal();
            const foodBill = calculateTotal('foodAmount');
            const discount = calculateTotal('discount');
            const offerDiscount = calculateTotal('offerDiscount') || 0;
            const gstAmount = calculateTotal('gstAmount');

            const subtotal = roomCharges + addOnCharges + foodBill - discount - offerDiscount;
            const grossAmount = subtotal + gstAmount;

            const amountPaid = transactions.reduce((total, transaction) => total + transaction.amountPaid, 0);

            return {
                totalRoomTariff: roomCharges,
                totalAddons: addOnCharges,
                totalFoodAmount: foodBill,
                totalGST: gstAmount,
                totalGrossTotal: grossAmount,
                totalPendingAmt: grossAmount - amountPaid,
            };
        };

        if (isGroupBooking && groupData) {
            setPaymentSummary(calculateSummary(groupData));
        } else if (!isGroupBooking && bookingData) {
            setPaymentSummary(calculateSummary([bookingData]));
        }
    }, [groupData, bookingData, addOnPrices, transactions, isGroupBooking]);

    const handleMakePaymentClick = () => setIsAddTransactionModalVisible(true);

    const showCheckoutModal = (roomId = null) => {
        setIsCheckoutModalVisible(true);
        if (roomId !== null) setSelectedRooms([roomId]);
    };

    const handleCheckoutConfirm = async () => {
        const bookingIds = isGroupBooking ? selectedRooms : [bookingData.bookingId];

        try {
            for (const bookingId of bookingIds) {
                const url = `http://ec2-54-211-23-206.compute-1.amazonaws.com:8081/roomStatus/checkOut?bookingId=${bookingId}`;

                const response = await fetch(url, {
                    method: 'PUT',
                    headers: {
                        Authorization: `Bearer ${authToken}`,
                        'Content-Type': 'application/json',
                    },
                });

                if (!response.ok) throw new Error(`Checkout failed for booking ID: ${bookingId}`);
            }

            toast({
                title: 'Success',
                description: 'Checkout successful',
                status: 'success',
                duration: 3000,
                isClosable: true,
            });

            await fetchBookingData();
            setIsCheckoutModalVisible(false);
            setSelectedRooms([]);
        } catch (error) {
            console.error('Error during checkout:', error);
            toast({
                title: 'Error',
                description: `Checkout failed: ${error.message}`,
                status: 'error',
                duration: 5000,
                isClosable: true,
            });
        }
    };

    const handleFoodBillSave = async () => {
        const bookingId = isGroupBooking ? groupId : bookingData?.bookingId;
        const foodAmount = foodBillAmount;
        const isGroup = isGroupBooking;

        if (!bookingId || foodAmount < 0) {
            toast({
                title: 'Error',
                description: 'Invalid booking ID or food bill amount',
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
            return;
        }

        try {
            const response = await fetch(
                `http://ec2-54-211-23-206.compute-1.amazonaws.com:8081/reservation/addFoodAmount?bookingId=${bookingId}&foodAmount=${foodAmount}&isGroup=${isGroup}`,
                {
                    method: 'PUT',
                    headers: {
                        Authorization: `Bearer ${authToken}`,
                        'Content-Type': 'application/json',
                    },
                }
            );

            if (!response.ok) throw new Error('Failed to add food bill amount');
            toast({
                title: 'Success',
                description: 'Food bill amount added successfully',
                status: 'success',
                duration: 3000,
                isClosable: true,
            });

            await fetchBookingData();
            setIsModalVisible(false);
        } catch (error) {
            console.error('Error adding food bill amount:', error);
            toast({
                title: 'Error',
                description: error.message,
                status: 'error',
                duration: 5000,
                isClosable: true,
            });
        }
    };

    const handleRoomSelect = (roomId) => {
        setSelectedRooms((prevSelectedRooms) =>
            prevSelectedRooms.includes(roomId)
                ? prevSelectedRooms.filter((id) => id !== roomId)
                : [...prevSelectedRooms, roomId]
        );
    };

    const computeBookingStatus = (booking) => {
        const currentDate = new Date();
        const checkinDate = new Date(booking.checkIn);
        const checkoutDate = new Date(booking.checkOut);
        let status = 'Unknown';

        if (currentDate < checkinDate) status = 'Due in';
        else if (currentDate >= checkinDate && currentDate < checkoutDate) status = 'Occupied';
        else if (currentDate >= checkoutDate) status = 'Due Out';

        if (booking.checkinStatus && booking.checkoutStatus) status = 'Checked out';
        else if (!booking.checkinStatus && !booking.checkoutStatus) status = 'Reserved';

        return status;
    };


    const handleCheckIn = async (bookingId) => {
        try {
            const response = await fetch(
                `http://ec2-54-211-23-206.compute-1.amazonaws.com:8081/roomStatus/checkIn?bookingId=${bookingId}`,
                {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${authToken}`
                    }
                }
            );
            const result = await response.text();
            if (response.ok) {
                toast({
                    title: "Success",
                    description: result,
                    status: "success",
                    duration: 3000,
                    isClosable: true
                });
                fetchBookingData();
            } else {
                toast({
                    title: "Error",
                    description: result,
                    status: "error",
                    duration: 3000,
                    isClosable: true
                });
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "An error occurred while checking in.",
                status: "error",
                duration: 3000,
                isClosable: true
            });
        }
    };

    const handleGroupCheckIn = async () => {
        const bookings = isGroupBooking ? groupData : [bookingData];

        try {
            for (const booking of bookings) {
                await fetch(
                    `http://ec2-54-211-23-206.compute-1.amazonaws.com:8081/roomStatus/checkIn?bookingId=${booking.bookingId}`,
                    {
                        method: 'PUT',
                        headers: {
                            'Authorization': `Bearer ${authToken}`
                        }
                    }
                );
            }
            fetchBookingData();
            toast({
                title: "Success",
                description: "Group check-in successful",
                status: "success",
                duration: 3000,
                isClosable: true
            });
        } catch (error) {
            toast({
                title: "Error",
                description: "An error occurred during group check-in.",
                status: "error",
                duration: 3000,
                isClosable: true
            });
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Due in':
                return 'yellow.500';
            case 'Occupied':
                return 'green.500';
            case 'Due Out':
                return 'red.500';
            case 'Reserved':
                return 'blue.500';
            case 'Checked out':
                return 'gray.500';
            default:
                return 'gray.500';
        }
    };

    const navigateToInvoice = (booking) => {
        console.log('result', paymentSummary)
        const formatDate = (date) => moment(date).format('YYYY-MM-DD');
        const formatTime = (time) => moment(time, 'HH:mm:ss').format('h:mm A');

        const totalGST = billingSummary.gstAmount;
        const cgst = totalGST / 2;
        const sgst = totalGST / 2;

        console.log('billingSummary--> ', billingSummary)
        const invoiceState = {
            authToken: authToken,
            bookingId: isGroupBooking ? groupId : bookingData.bookingId,
            isGroupBooking: isGroupBooking,
            customerName: isGroupBooking ? groupData[0].customerName : bookingData.customerName,
            checkIn: formatDate(isGroupBooking ? groupData[0].checkIn : bookingData.checkIn),
            checkOut: formatDate(isGroupBooking ? groupData[0].checkOut : bookingData.checkOut),
            phoneNumber: isGroupBooking ? groupData[0].phoneNumber : bookingData.phoneNumber,
            email: isGroupBooking ? groupData[0].email : bookingData.email,
            address: isGroupBooking ? groupData[0].address : bookingData.address,
            roomTotal: paymentSummary.totalRoomTariff,
            addOnTotal: paymentSummary.totalAddons,
            gstAmount: paymentSummary.totalGST,
            checkInTime: formatTime(isGroupBooking ? groupData[0].checkInTime : bookingData.checkInTime),
            checkOutTime: formatTime(isGroupBooking ? groupData[0].checkOutTime : bookingData.checkOutTime),
            discount: discount,
            grossTotal: paymentSummary.totalGrossTotal,
            pendingAmt: paymentSummary.totalPendingAmt,
            billingSummary: {
                ...billingSummary,
                cgst: cgst,
                sgst: sgst
            },
            roomNumber: isGroupBooking ? null : bookingData.roomNumber
        };

        history.push('/invoice', invoiceState);
    };


    const fetchExistingCombinedBills = async (bookings) => {
        const combinedBillBookings = new Set();
        for (const booking of bookings) {
            try {
                const response = await fetch(
                    `http://ec2-54-211-23-206.compute-1.amazonaws.com:8081/billing/getCombineBillForBooking?id=${booking.bookingId}`,
                    {
                        headers: {
                            'Authorization': `Bearer ${authToken}`
                        }
                    }
                );
                const combinedBillData = await response.json();
                if (combinedBillData.length > 0) {
                    combinedBillData[0].bookings.forEach(b => combinedBillBookings.add(b.bookingId));
                }
            } catch (error) {
                console.error(`Error checking combined bill for booking ${booking.bookingId}:`, error);
            }
        }
        return combinedBillBookings;
    };

    const checkCombinedBillExists = async (bookingId) => {
        try {
            const response = await fetch(
                `http://ec2-54-211-23-206.compute-1.amazonaws.com:8081/billing/getCombineBillForBooking?id=${bookingId}`,
                {
                    headers: {
                        'Authorization': `Bearer ${authToken}`
                    }
                }
            );
            const combinedBillData = await response.json();
            return combinedBillData;
        } catch (error) {
            console.error(`Error checking combined bill for booking ${bookingId}:`, error);
            return null;
        }
    };

    const handlePayMultipleBookings = async () => {
        const currentBookingId = isGroupBooking ? groupId : bookingData.bookingId;
        const combinedBillData = await checkCombinedBillExists(currentBookingId);

        if (combinedBillData && combinedBillData.length > 0) {
            // Open the Combined Bill Details modal
            setCombinedBillDetails(combinedBillData[0]);
            setIsCombinedBillModalOpen(true);
        } else {
            // Proceed with the existing flow for selecting multiple bookings
            setSelectedBookings([]);
            const startDate = moment().format('YYYY-MM-DD');
            const endDate = moment().add(30, 'days').format('YYYY-MM-DD');
            const bookings = await fetchBookingsForSelection(startDate, endDate);
            const availableBookings = bookings.filter(booking => booking.bookingId !== currentBookingId);

            if (availableBookings.length === 0) {
                toast({
                    title: 'No Available Bookings',
                    description: 'There are no other bookings available to combine.',
                    status: 'info',
                    duration: 5000,
                    isClosable: true,
                });
                return;
            }

            setBookingsForSelection(availableBookings);
            setIsMultiplePaymentModalOpen(true);
        }
    };

    const fetchBookingsForSelection = async (startDate, endDate) => {
        try {
            const response = await fetch(
                `http://ec2-54-211-23-206.compute-1.amazonaws.com:8081/reservation/getByRange?start=${startDate}&end=${endDate}`,
                {
                    headers: {
                        'Authorization': `Bearer ${authToken}`
                    }
                }
            );
            if (!response.ok) throw new Error('Failed to fetch bookings');
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching bookings:', error);
            toast({
                title: 'Error',
                description: 'Failed to fetch bookings for selection',
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
            return [];
        }
    };

    const handleConfirmMultipleBookings = async () => {
        setIsMultiplePaymentModalOpen(false);

        // Check if any of the selected bookings are already part of a combined bill
        const combinedBillBookings = [];

        for (const bookingId of selectedBookings) {
            const response = await fetch(
                `http://ec2-54-211-23-206.compute-1.amazonaws.com:8081/billing/getCombineBillForBooking?id=${bookingId}`,
                {
                    headers: {
                        'Authorization': `Bearer ${authToken}`
                    }
                }
            );
            const combinedBillData = await response.json();

            if (combinedBillData.length > 0) {
                combinedBillBookings.push(...combinedBillData);
            }
        }

        if (combinedBillBookings.length > 0) {
            // Display the bookings that are already part of a combined bill
            toast({
                title: 'Combined Bill Exists',
                description: `The following bookings are already part of a combined bill: ${combinedBillBookings.map(booking => booking.bookingId).join(', ')}`,
                status: 'info',
                duration: 5000,
                isClosable: true,
            });
            return;
        }

        // Calculate total pending amount
        const totalPendingAmount = bookingsForSelection
            .filter(booking => selectedBookings.includes(booking.bookingId))
            .reduce((sum, booking) => sum + booking.pendingAmt, 0);

        // Open payment modal with combined bill information
        setPaymentModalData({
            bookingIds: selectedBookings,
            totalAmount: totalPendingAmount,
        });
        setIsPaymentModalOpen(true);
    };


    const handleCombinedPaymentSubmit = async (paymentData) => {
        try {
            const response = await fetch(
                'http://ec2-54-211-23-206.compute-1.amazonaws.com:8081/billing/payCombineBillNew',
                {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${authToken}`
                    },
                    body: JSON.stringify(paymentData)
                }
            );

            if (!response.ok) throw new Error('Payment failed');

            const result = await response.text();
            toast({
                title: 'Success',
                description: result,
                status: 'success',
                duration: 3000,
                isClosable: true,
            });

            setIsPaymentModalOpen(false);
            fetchBookingData(); // Refresh the booking data
        } catch (error) {
            console.error('Error processing combined payment:', error);
            toast({
                title: 'Error',
                description: 'Failed to process combined payment',
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
        }
    };

    const renderCheckoutModal = () => (
        <Modal isOpen={isCheckoutModalVisible} onClose={() => setIsCheckoutModalVisible(false)}>
            <ModalOverlay />
            <ModalContent bg={menuBg}>
                <ModalHeader color={menuTextColor}>Checkout {isGroupBooking ? 'Rooms' : 'Room'}</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    {isGroupBooking ? (
                        <>
                            <Checkbox
                                isChecked={selectedRooms.length === groupData.length}
                                isIndeterminate={selectedRooms.length > 0 && selectedRooms.length < groupData.length}
                                onChange={(e) =>
                                    setSelectedRooms(e.target.checked ? groupData.map((room) => room.bookingId) : [])
                                }
                                mb={4}
                            >
                                Select All
                            </Checkbox>
                            <Divider mb={4} />
                            {groupData.map((room) => (
                                <Checkbox
                                    key={room.bookingId}
                                    isChecked={selectedRooms.includes(room.bookingId)}
                                    onChange={() => handleRoomSelect(room.bookingId)}
                                    isDisabled={
                                        computeBookingStatus(room) !== 'Due Out' && computeBookingStatus(room) !== 'Occupied'
                                    }
                                    mb={2}
                                >
                                    Room {room.roomNumber} - {room.roomType} (Booking ID: {room.bookingId}) - Status:{' '}
                                    {computeBookingStatus(room)}
                                </Checkbox>
                            ))}
                            {selectedRooms.length > 0 && (
                                <Text color={menuTextColor} mt={4}>
                                    Total pending amount for selected rooms: ₹
                                    {formatAmount(
                                        selectedRooms.reduce((total, bookingId) => {
                                            const room = groupData.find(r => r.bookingId === bookingId);
                                            return total + (room ? room.pendingAmt : 0);
                                        }, 0)
                                    )}
                                </Text>
                            )}
                        </>
                    ) : (
                        <Text color={menuTextColor}>
                            Your pending amount is ₹{formatAmount(bookingData.pendingAmt)}. Would you still like to check out?
                        </Text>
                    )}
                </ModalBody>
                <ModalFooter>
                    <Button
                        colorScheme="blue"
                        mr={3}
                        onClick={handleCheckoutConfirm}
                        isDisabled={isGroupBooking && selectedRooms.length === 0}
                    >
                        Confirm Checkout
                    </Button>
                    <Button variant="ghost" onClick={() => setIsCheckoutModalVisible(false)}>
                        Cancel
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );


    const MultipleBookingsModal = ({ isOpen, onClose, selectedBookings, setSelectedBookings, onConfirm, fetchBookings, authToken }) => {
        const [searchTerm, setSearchTerm] = useState('');
        const [dateRange, setDateRange] = useState([
            {
                startDate: new Date(),
                endDate: new Date(new Date().setDate(new Date().getDate() + 30)),
                key: 'selection'
            }
        ]);
        const [bookings, setBookings] = useState([]);
        const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
        const [isLoading, setIsLoading] = useState(false);

        const bgColor = useColorModeValue("white", "gray.800");
        const textColor = useColorModeValue("gray.800", "white");
        const borderColor = useColorModeValue("gray.200", "gray.600");


        useEffect(() => {
            const fetchInitialBookings = async () => {
                const startDate = format(new Date(), 'yyyy-MM-dd');
                const endDate = format(new Date(new Date().setDate(new Date().getDate() + 30)), 'yyyy-MM-dd');
                const fetchedBookings = await fetchBookings(startDate, endDate);
                setBookings(fetchedBookings);
            };

            fetchInitialBookings();
        }, [fetchBookings]);


        const handleSearch = async () => {
            setIsLoading(true);
            try {
                const startDate = format(dateRange[0].startDate, 'yyyy-MM-dd');
                const endDate = format(dateRange[0].endDate, 'yyyy-MM-dd');
                const fetchedBookings = await fetchBookings(startDate, endDate);
                setBookings(fetchedBookings);
            } catch (error) {
                console.error("Error fetching bookings:", error);
                toast({
                    title: "Error",
                    description: "Failed to fetch bookings. Please try again.",
                    status: "error",
                    duration: 3000,
                    isClosable: true,
                });
            } finally {
                setIsLoading(false);
            }
        };

        const handleDateRangeChange = (item) => {
            setDateRange([item.selection]);
        };

        const filteredBookings = bookings.filter(booking =>
        (booking.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            booking.bookingId.toString().includes(searchTerm))
        );

        const handleSelect = (selectedOptions) => {
            setSelectedBookings(selectedOptions.map(option => option.value));
        };

        const options = filteredBookings.map(booking => ({
            value: booking.bookingId,
            label: (
                <Flex justifyContent="space-between" width="100%">
                    <Text>
                        #{booking.bookingId} - {booking.customerName} {booking.roomNumber}
                    </Text>
                    <Badge colorScheme="green">₹{booking.pendingAmt}</Badge>
                </Flex>
            )
        }));
        return (
            <Modal isOpen={isOpen} onClose={onClose} size="4xl">
                <ModalOverlay />
                <ModalContent bg={bgColor}>
                    <ModalHeader color={textColor}>Select Bookings for Combined Payment</ModalHeader>
                    <ModalCloseButton color={textColor} />
                    <ModalBody>
                        <VStack spacing={4} align="stretch">
                            <HStack spacing={4}>
                                <InputGroup flex={1}>
                                    <InputLeftElement pointerEvents="none" children={<SearchIcon color="gray.300" />} />
                                    <Input
                                        placeholder="Search by name or booking ID"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        color={textColor}
                                    />
                                </InputGroup>
                                <Button
                                    onClick={() => setIsDatePickerOpen(!isDatePickerOpen)}
                                    rightIcon={<CalendarIcon />}
                                    width="300px"
                                    color={textColor}
                                    bg={bgColor}
                                    borderColor={borderColor}
                                    borderWidth="1px"
                                >
                                    {format(dateRange[0].startDate, 'MMM dd, yyyy')} - {format(dateRange[0].endDate, 'MMM dd, yyyy')}
                                </Button>
                                <Button colorScheme="blue" onClick={handleSearch}>
                                    Search
                                </Button>
                            </HStack>
                            {isDatePickerOpen && (
                                <Box borderWidth={1} borderColor={borderColor} borderRadius="md" p={2}>
                                    <DateRangePicker
                                        onChange={handleDateRangeChange}
                                        ranges={dateRange}
                                        months={2}
                                        direction="horizontal"
                                    />
                                </Box>
                            )}
                            {isLoading ? (
                                <Flex justify="center">
                                    <Spinner />
                                </Flex>
                            ) : (
                                <Select
                                    isMulti
                                    name="bookings"
                                    options={options}
                                    placeholder="Select bookings..."
                                    closeMenuOnSelect={false}
                                    onChange={handleSelect}
                                    value={options.filter(option => selectedBookings.includes(option.value))}
                                    chakraStyles={{
                                        container: (provided) => ({
                                            ...provided,
                                            color: textColor,
                                        }),
                                        control: (provided) => ({
                                            ...provided,
                                            backgroundColor: bgColor,
                                            borderColor: borderColor,
                                        }),
                                        menu: (provided) => ({
                                            ...provided,
                                            backgroundColor: bgColor,
                                        }),
                                        option: (provided, state) => ({
                                            ...provided,
                                            backgroundColor: state.isFocused ? 'blue.500' : bgColor,
                                            color: state.isFocused ? 'white' : textColor,
                                        }),
                                    }}
                                />
                            )}
                        </VStack>
                    </ModalBody>
                    <ModalFooter>
                        <Button colorScheme="blue" mr={3} onClick={onConfirm} isDisabled={isLoading || selectedBookings.length === 0}>
                            Confirm Selection ({selectedBookings.length})
                        </Button>
                        <Button variant="ghost" onClick={onClose} color={textColor}>Cancel</Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        );
    };


    const CombinedBillDetailsModal = ({ isOpen, onClose, combinedBillDetails, authToken, onPaymentComplete }) => {
        const [paymentAmount, setPaymentAmount] = useState(0);
        const [paymentMode, setPaymentMode] = useState('Cash');
        const { isOpen: isPaymentConfirmOpen, onOpen: openPaymentConfirm, onClose: closePaymentConfirm } = useDisclosure();

        if (!combinedBillDetails) {
            return null;
        }

        const totalAmount = combinedBillDetails.bookings.reduce((sum, booking) => sum + booking.grossTotal, 0);
        const totalPaid = combinedBillDetails.amountPaid;
        const pendingAmount = totalAmount - totalPaid;

        const handlePayment = async () => {
            try {
                const response = await fetch('http://ec2-54-211-23-206.compute-1.amazonaws.com:8081/billing/payCombineBillNew', {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${authToken}`
                    },
                    body: JSON.stringify({
                        bookingIdList: combinedBillDetails.bookings.map(b => b.bookingId),
                        amountPaid: paymentAmount,
                        transactionDto: {
                            paymentMode: paymentMode,
                            date: moment().format('YYYY-MM-DD')
                        }
                    })
                });

                if (response.ok) {
                    toast({
                        title: 'Payment Successful',
                        description: `Successfully paid ₹${formatAmount(paymentAmount)}`,
                        status: 'success',
                        duration: 3000,
                        isClosable: true,
                    });
                    onPaymentComplete();
                    onClose();
                } else {
                    throw new Error('Payment failed');
                }
            } catch (error) {
                toast({
                    title: 'Payment Failed',
                    description: error.message,
                    status: 'error',
                    duration: 3000,
                    isClosable: true,
                });
            }
            closePaymentConfirm();
        };

        return (
            <Modal isOpen={isOpen} onClose={onClose} size="xl">
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Combined Bill Details</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <VStack spacing={4} align="stretch">
                            <Box borderWidth={1} borderRadius="md" p={4}>
                                <Heading size="md" mb={2}>Summary</Heading>
                                <SimpleGrid columns={2} spacing={2}>
                                    <Text fontWeight="bold">Total Amount:</Text>
                                    <Text>₹{formatAmount(totalAmount)}</Text>
                                    <Text fontWeight="bold">Amount Paid:</Text>
                                    <Text>₹{formatAmount(totalPaid)}</Text>
                                    <Text fontWeight="bold">Pending Amount:</Text>
                                    <Text color={pendingAmount > 0 ? "red.500" : "green.500"}>
                                        ₹{formatAmount(pendingAmount)}
                                    </Text>
                                </SimpleGrid>
                            </Box>

                            <Box>
                                <Heading size="md" mb={2}>Bookings</Heading>
                                <Table variant="simple">
                                    <Thead>
                                        <Tr>
                                            <Th>Booking ID</Th>
                                            <Th>Customer</Th>
                                            <Th>Room</Th>
                                            <Th>Amount</Th>
                                        </Tr>
                                    </Thead>
                                    <Tbody>
                                        {combinedBillDetails.bookings.map(booking => (
                                            <Tr key={booking.bookingId}>
                                                <Td>{booking.bookingId}</Td>
                                                <Td>{booking.customerName}</Td>
                                                <Td>{booking.roomNumber}</Td>
                                                <Td>₹{formatAmount(booking.grossTotal)}</Td>
                                            </Tr>
                                        ))}
                                    </Tbody>
                                </Table>
                            </Box>

                            {pendingAmount > 0 && (
                                <Box>
                                    <Heading size="md" mb={2}>Make Payment</Heading>
                                    <SimpleGrid columns={2} spacing={4}>
                                        <FormControl>
                                            <FormLabel>Amount</FormLabel>
                                            <NumberInput
                                                value={paymentAmount}
                                                onChange={(value) => setPaymentAmount(Math.round(Number(value)))}
                                                max={pendingAmount}
                                            >
                                                <NumberInputField />
                                                <NumberInputStepper>
                                                    <NumberIncrementStepper />
                                                    <NumberDecrementStepper />
                                                </NumberInputStepper>
                                            </NumberInput>
                                        </FormControl>
                                        <FormControl>
                                            <FormLabel>Payment Mode</FormLabel>
                                            <Select
                                                value={paymentMode}
                                                onChange={(e) => setPaymentMode(e.target.value)}
                                            >
                                                <option value="Cash">Cash</option>
                                                <option value="Online">Online</option>
                                                <option value="Credit Card">Credit Card</option>
                                                <option value="UPI">UPI</option>
                                            </Select>
                                        </FormControl>
                                    </SimpleGrid>
                                    <Button
                                        mt={4}
                                        colorScheme="blue"
                                        onClick={openPaymentConfirm}
                                        isDisabled={paymentAmount <= 0 || paymentAmount > pendingAmount}
                                    >
                                        Make Payment
                                    </Button>
                                </Box>
                            )}
                        </VStack>
                    </ModalBody>
                </ModalContent>

                <AlertDialog
                    isOpen={isPaymentConfirmOpen}
                    leastDestructiveRef={undefined}
                    onClose={closePaymentConfirm}
                >
                    <AlertDialogOverlay>
                        <AlertDialogContent>
                            <AlertDialogHeader fontSize="lg" fontWeight="bold">
                                Confirm Payment
                            </AlertDialogHeader>
                            <AlertDialogBody>
                                Are you sure you want to make a payment of ₹{formatAmount(paymentAmount)} for this combined bill?
                            </AlertDialogBody>
                            <AlertDialogFooter>
                                <Button onClick={closePaymentConfirm}>
                                    Cancel
                                </Button>
                                <Button colorScheme="blue" onClick={handlePayment} ml={3}>
                                    Confirm Payment
                                </Button>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialogOverlay>
                </AlertDialog>
            </Modal>
        );
    };


    const CombinedPaymentModal = ({ isOpen, onClose, data, onPaymentSubmit }) => {
        const [amountPaid, setAmountPaid] = useState(data.totalAmount);
        const [paymentMode, setPaymentMode] = useState('Cash');
        const handleSubmit = () => {
            onPaymentSubmit({
                bookingIdList: data.bookingIds,
                amountPaid: amountPaid,
                transactionDto: {
                    paymentMode: paymentMode,
                    date: moment().format('YYYY-MM-DD')
                }
            });
        };

        return (
            <Modal isOpen={isOpen} onClose={onClose}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Combined Payment</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <VStack spacing={4}>
                            <Text>Total Pending Amount: ₹{data.totalAmount}</Text>
                            <FormControl>
                                <FormLabel>Amount to Pay</FormLabel>
                                <NumberInput value={amountPaid} onChange={(value) => setAmountPaid(parseFloat(value))}>
                                    <NumberInputField />
                                </NumberInput>
                            </FormControl>
                            <FormControl>
                                <FormLabel>Payment Mode</FormLabel>
                                <Select
                                    value={paymentMode}
                                    onChange={(e) => setPaymentMode(e.target.value)}
                                >
                                    <option value="Cash">Cash</option>
                                    <option value="Online">Online</option>
                                    <option value="Credit Card">Credit Card</option>
                                    <option value="UPI">UPI</option>
                                </Select>
                            </FormControl>
                        </VStack>
                    </ModalBody>
                    <ModalFooter>
                        <Button colorScheme="blue" mr={3} onClick={handleSubmit}>
                            Submit Payment
                        </Button>
                        <Button variant="ghost" onClick={onClose}>Cancel</Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        );
    };

    // Color mode values
    const bg = useColorModeValue('white', 'gray.800');
    const textColor = useColorModeValue('gray.800', 'white');
    const borderColor = useColorModeValue('gray.200', 'gray.600');
    const headerBg = useColorModeValue('blue.500', 'blue.200');
    const headerTextColor = useColorModeValue('white', 'gray.800');
    const cardBg = useColorModeValue('white', 'gray.700');
    const hoverBg = useColorModeValue('gray.100', 'gray.600');
    const pageBackground = useColorModeValue(
        'linear(to-br, blue.100, purple.100)',
        'linear(to-br, blue.900, purple.900)'
    );
    const menuBg = useColorModeValue('white', 'gray.700');
    const menuTextColor = useColorModeValue('gray.800', 'white');

    if (loading) {
        return (
            <Flex justify="center" align="center" h="100vh">
                <Spinner size="xl" />
            </Flex>
        );
    }

    if (!bookingData && !groupData) {
        return (
            <Box p={4}>
                <Text fontSize="xl" color="red.500">
                    Error: Unable to fetch booking data
                </Text>
            </Box>
        );
    }

    const renderGuestDetails = (guestInfo) => {
        const checkInDate = new Date(guestInfo.checkIn);
        const checkOutDate = new Date(guestInfo.checkOut);
        const nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));

        return (
            <Box
                bg={cardBg}
                borderRadius="15px"
                boxShadow="0 4px 6px rgba(0, 0, 0, 0.1)"
                p={4}
                mb={4}
            >
                <Flex justifyContent="space-between" alignItems="center" mb={3}>
                    <Heading size="md" color={textColor}>Guest Details</Heading>
                    <Badge colorScheme={getStatusColor(computeBookingStatus(guestInfo))}>
                        {computeBookingStatus(guestInfo)}
                    </Badge>
                </Flex>
                <Grid templateColumns="repeat(3, 1fr)" gap={4}>
                    <HStack>
                        <Icon as={FaUser} color="blue.500" />
                        <VStack align="start" spacing={0}>
                            <Text fontSize="sm" color="gray.500">Guest Name</Text>
                            <Text fontWeight="bold" color={textColor}>{guestInfo.title} {guestInfo.customerName}</Text>
                        </VStack>
                    </HStack>
                    <HStack>
                        <Icon as={FaPhone} color="green.500" />
                        <VStack align="start" spacing={0}>
                            <Text fontSize="sm" color="gray.500">Phone</Text>
                            <Text fontWeight="bold" color={textColor}>{guestInfo.phoneNumber}</Text>
                        </VStack>
                    </HStack>
                    <HStack>
                        <Icon as={FaEnvelope} color="orange.500" />
                        <VStack align="start" spacing={0}>
                            <Text fontSize="sm" color="gray.500">Email</Text>
                            <Text fontWeight="bold" color={textColor}>{guestInfo.email}</Text>
                        </VStack>
                    </HStack>
                    <HStack>
                        <Icon as={FaMoon} color="purple.500" />
                        <VStack align="start" spacing={0}>
                            <Text fontSize="sm" color="gray.500">Stay Duration</Text>
                            <Text fontWeight="bold" color={textColor}>{nights} nights</Text>
                        </VStack>
                    </HStack>
                    <HStack>
                        <Icon as={FaMapMarkerAlt} color="red.500" />
                        <VStack align="start" spacing={0}>
                            <Text fontSize="sm" color="gray.500">Address</Text>
                            <Text fontWeight="bold" color={textColor} noOfLines={1}>{guestInfo.address}</Text>
                        </VStack>
                    </HStack>
                    <VStack align="start" spacing={0}>
                        <Text fontSize="sm" color="gray.500">Check-in / Check-out</Text>
                        <Text fontWeight="bold" color={textColor}>
                            {format(checkInDate, 'dd MMM yyyy')} - {format(checkOutDate, 'dd MMM yyyy')}
                        </Text>
                    </VStack>
                </Grid>
            </Box>
        );
    };

    const renderRoomCard = (booking) => {
        const bookingStatus = computeBookingStatus(booking);

        console.log('booking time', booking)
        return (
            <Box
                key={booking.bookingId}
                bg={cardBg}
                borderRadius="10px"
                boxShadow="0 2px 4px rgba(0, 0, 0, 0.1)"
                p={3}
                width="220px"
            >
                <Flex justifyContent="space-between" alignItems="center" mb={2}>
                    <HStack>
                        <Icon as={FaBed} color={textColor} boxSize={4} />
                        <Text fontWeight="bold" color={textColor}>
                            Room {booking.roomNumber}
                        </Text>
                    </HStack>
                    <Badge colorScheme={getStatusColor(bookingStatus)} fontSize="xs">
                        {bookingStatus}
                    </Badge>
                </Flex>
                <Text fontSize="sm" color={textColor} mb={1}>
                    {booking.roomType}
                </Text>
                <Divider my={2} />
                <VStack spacing={1} align="stretch">
                    <Flex justifyContent="space-between">
                        <HStack>
                            <Icon as={BsBoxArrowInLeft} color="green.500" boxSize={3} />
                            <Text fontSize="xs" color={textColor}>
                                {new Date(booking.checkIn).toLocaleDateString()}
                            </Text>
                        </HStack>
                        <Text fontSize="xs" color={textColor}>
                            {booking.checkInTime}
                        </Text>
                    </Flex>
                    <Flex justifyContent="space-between">
                        <HStack>
                            <Icon as={BsBoxArrowRight} color="red.500" boxSize={3} />
                            <Text fontSize="xs" color={textColor}>
                                {new Date(booking.checkOut).toLocaleDateString()}
                            </Text>
                        </HStack>
                        <Text fontSize="xs" color={textColor}>
                            {booking.checkOutTime}
                        </Text>
                    </Flex>
                    <Flex justifyContent="space-between" alignItems="center">
                        <HStack>
                            <Icon as={FaMoneyBillWave} color="blue.500" boxSize={3} />
                            <Text fontSize="sm" fontWeight="bold" color={textColor}>
                                ₹{booking.grossTotal}
                            </Text>
                        </HStack>
                        <Icon
                            as={FaCalendarAlt}
                            color="purple.500"
                            boxSize={3}
                            title={`${Math.ceil((new Date(booking.checkOut) - new Date(booking.checkIn)) / (1000 * 60 * 60 * 24))} nights`}
                        />
                    </Flex>
                </VStack>
            </Box>
        );
    };

    const renderPaymentSummary = (summary) => {
        console.log('Payment Summary:', summary);
        return (
            <Box
                bg={cardBg}
                borderRadius="15px"
                boxShadow="0 4px 6px rgba(0, 0, 0, 0.1)"
                p={4}
                mb={4}
            >
                <Flex justifyContent="space-between" alignItems="center" mb={3}>
                    <Heading size="md" color={textColor}>Payment Summary</Heading>
                    <Badge colorScheme={summary.totalPendingAmt > 0 ? "yellow" : "green"} fontSize="md">
                        {summary.totalPendingAmt > 0 ? "Pending" : "Paid"}
                    </Badge>
                </Flex>
                <Grid templateColumns="repeat(3, 1fr)" gap={4}>
                    <HStack>
                        <Icon as={MdHotel} color="blue.500" />
                        <VStack align="start" spacing={0}>
                            <Text fontSize="sm" color="gray.500">Room Tariff (incl. Breakfast)</Text>
                            <Text fontWeight="bold" color={textColor}>₹{summary.totalRoomTariff}</Text>
                        </VStack>
                    </HStack>
                    <HStack>
                        <Icon as={MdAddCircle} color="green.500" />
                        <VStack align="start" spacing={0}>
                            <Text fontSize="sm" color="gray.500">Add-ons (Mattress)</Text>
                            <Text fontWeight="bold" color={textColor}>₹{summary.totalAddons}</Text>
                        </VStack>
                    </HStack>
                    <HStack>
                        <Icon as={FaUtensils} color="orange.500" />
                        <VStack align="start" spacing={0}>
                            <Text fontSize="sm" color="gray.500">Food Bill</Text>
                            <Text fontWeight="bold" color={textColor}>₹{summary.totalFoodAmount}</Text>
                        </VStack>
                    </HStack>
                    <HStack>
                        <Icon as={FaPercent} color="purple.500" />
                        <VStack align="start" spacing={0}>
                            <Text fontSize="sm" color="gray.500">Total GST</Text>
                            <Text fontWeight="bold" color={textColor}>₹{summary.totalGST}</Text>
                        </VStack>
                    </HStack>
                    <HStack>
                        <Icon as={FaMoneyBillWave} color="teal.500" />
                        <VStack align="start" spacing={0}>
                            <Text fontSize="sm" color="gray.500">Gross Total</Text>
                            <Text fontWeight="bold" color={textColor}>₹{summary.totalGrossTotal}</Text>
                        </VStack>
                    </HStack>
                    <HStack>
                        <Icon as={FaWallet} color={summary.totalPendingAmt > 0 ? "red.500" : "green.500"} />
                        <VStack align="start" spacing={0}>
                            <Text fontSize="sm" color="gray.500">Pending Amount</Text>
                            <Text fontWeight="bold" color={textColor}>₹{summary.totalPendingAmt}</Text>
                        </VStack>
                    </HStack>
                </Grid>
            </Box>
        );
    };


    const renderContent = () => {
        const bookings = isGroupBooking ? groupData : [bookingData];
        const guestInfo = bookings[0];

        return (
            <Box minHeight="100vh" p={5} bgGradient={pageBackground}>
                <VStack spacing={4} align="stretch" maxWidth="1200px" margin="auto">
                    <Flex
                        bg={headerBg}
                        color={headerTextColor}
                        p={4}
                        borderRadius="15px"
                        boxShadow="0 4px 6px rgba(0, 0, 0, 0.1)"
                        mb={4}
                        alignItems="center"
                    >
                        <Button variant="ghost" color={headerTextColor} onClick={() => history.goBack()}>
                            <ArrowBackIcon />
                            Back
                        </Button>
                        <Heading size="md" ml={4}>
                            {isGroupBooking ? `Group Settlement - ID #${groupId}` : `Settlement - Booking ID #${guestInfo.bookingId}`}
                        </Heading>
                    </Flex>

                    {renderGuestDetails(guestInfo)}
                    {renderPaymentSummary(paymentSummary)}

                    <Flex flexWrap="wrap" justifyContent="flex-start" gap={4}>
                        {bookings.map(renderRoomCard)}
                    </Flex>

                    <Flex justifyContent="space-between" mt={4}>
                        <Button
                            leftIcon={<MoonIcon />}
                            colorScheme="blue"
                            onClick={handleMakePaymentClick}
                        >
                            Make Payment
                        </Button>
                        <Button
                            leftIcon={<AddIcon />}
                            colorScheme="green"
                            onClick={() => setIsModalVisible(true)}
                        >
                            Add Food Bill
                        </Button>
                        <Button
                            leftIcon={<CalendarIcon />}
                            colorScheme="red"
                            onClick={showCheckoutModal}
                            isDisabled={!guestInfo.checkinStatus || computeBookingStatus(guestInfo) === 'Checked out'}
                        >
                            Check Out
                        </Button>
                        <Button
                            leftIcon={<DownloadIcon />}
                            colorScheme="teal"
                            onClick={() => navigateToInvoice(guestInfo)}  // Pass the guestInfo (or booking) object here
                        >
                            Generate Invoice
                        </Button>
                        <Button
                            leftIcon={<Icon as={FaMoneyBillWave} />}
                            colorScheme="teal"
                            onClick={handlePayMultipleBookings}
                        >
                            Pay for Multiple Bookings
                        </Button>
                    </Flex>
                </VStack>
            </Box>
        );
    };

    return (
        <Box minHeight="100vh" p={4}>
            {renderContent()}
            {renderCheckoutModal()}

            <Modal isOpen={isModalVisible} onClose={() => setIsModalVisible(false)}>
                <ModalOverlay />
                <ModalContent bg={menuBg}>
                    <ModalHeader color={menuTextColor}>Add Food Bill</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <FormControl>
                            <FormLabel color={menuTextColor}>Food Bill Amount</FormLabel>
                            <Input
                                type="number"
                                value={foodBillAmount}
                                onChange={(e) => setFoodBillAmount(parseFloat(e.target.value))}
                                min={0}
                            />
                        </FormControl>
                    </ModalBody>
                    <ModalFooter>
                        <Button colorScheme="blue" mr={3} onClick={handleFoodBillSave}>
                            Save
                        </Button>
                        <Button variant="ghost" onClick={() => setIsModalVisible(false)}>
                            Cancel
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            <Modal
                isOpen={isAddTransactionModalVisible}
                onClose={() => setIsAddTransactionModalVisible(false)}
                size="xl"
            >
                <ModalOverlay />
                <ModalContent bg={menuBg}>
                    <ModalHeader color={menuTextColor}>Make Payment</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <Text fontSize="lg" color={menuTextColor} mb={4}>
                            <strong>Pending Amount:</strong> ₹
                            {isGroupBooking ? paymentSummary.totalPendingAmt : bookingData?.pendingAmt}
                        </Text>
                        <UnifiedTransactionComponent
                            bookingId={isGroupBooking ? null : bookingData?.bookingId}
                            groupId={isGroupBooking ? groupId : null}
                            authToken={authToken}
                            onTransactionsUpdated={handleTransactionsUpdated} // Pass the callback
                        //onTransactionsUpdated={handleTransactionsUpdated}
                        />
                    </ModalBody>
                </ModalContent>
            </Modal>
            <MultipleBookingsModal
                isOpen={isMultiplePaymentModalOpen}
                onClose={() => setIsMultiplePaymentModalOpen(false)}
                selectedBookings={selectedBookings}
                setSelectedBookings={setSelectedBookings}
                onConfirm={handleConfirmMultipleBookings}
                fetchBookings={fetchBookingsForSelection}
                authToken={authToken}
            />

            <CombinedPaymentModal
                isOpen={isPaymentModalOpen}
                onClose={() => setIsPaymentModalOpen(false)}
                data={paymentModalData}
                onPaymentSubmit={handleCombinedPaymentSubmit}
            />
            <CombinedBillDetailsModal
                isOpen={isCombinedBillModalOpen}
                onClose={() => setIsCombinedBillModalOpen(false)}
                combinedBillDetails={combinedBillDetails}
                authToken={authToken}
                onPaymentComplete={fetchBookingData}
            />
        </Box>
    );
};

export default CombinedSettlementPage;