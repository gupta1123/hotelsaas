import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import {
    Box, VStack, HStack, Text, Heading, Button, Icon, Flex, Spacer,
    Menu, MenuButton, MenuList, MenuItem, Badge, Grid, IconButton,
    useColorModeValue, Collapse, useToast, Skeleton, Modal,
    ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody,
    ModalCloseButton, FormControl, Tooltip, FormLabel, Input, Select, Avatar
} from '@chakra-ui/react';
import {
    ChevronLeftIcon, EditIcon, AddIcon, EmailIcon, PhoneIcon,
    CalendarIcon, InfoIcon, SettingsIcon, ChevronDownIcon,
    ChevronUpIcon, RepeatIcon, DeleteIcon
} from '@chakra-ui/icons';
import { FaHotel, FaUser, FaUsers, FaGlobe, FaIdCard, FaMoneyBillWave, FaEllipsisV, FaPhone, FaBirthdayCake, FaBed, FaEnvelope, FaInfo, FaPlus, FaPercent, FaCalendarAlt, FaFileInvoice, FaTrash } from 'react-icons/fa';
import BillingSummary from '../modals/BillingSummary';
import ExtendBooking from '../modals/ExtendBooking';
import EditGuestModal from '../modals/EditGuestModal';
import CancelDeleteBookingModal from '../modals/CancelDeleteBookingModal';
import AddDiscountModal from '../modals/AddDiscountModal';
import ChangeRoom from '../modals/ChangeRoom';
import EditAddons from '../modals/EditAddons';
import UnifiedTransactionComponent from '../modals/UnifiedTransactionComponent';
import AdditionalGuestModal from '../modals/AdditionalGuestModal';
import TaskModal from '../modals/TaskModal';
import AddOffersModal from '../modals/AddOffersModal'; // Import the AddOffersModal component
import moment from 'moment';

const BookingConfirmation = ({ authToken }) => {
    const { bookingId, groupId } = useParams();
    const history = useHistory();
    const toast = useToast();
    const isGroupBooking = !!groupId;
    const [bookingData, setBookingData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showAdditionalGuests, setShowAdditionalGuests] = useState(false);
    const [showTransactions, setShowTransactions] = useState(false);
    const [isExtendModalOpen, setIsExtendModalOpen] = useState(false);
    const [isEditGuestModalVisible, setIsEditGuestModalVisible] = useState(false);
    const [isCancelDeleteModalVisible, setIsCancelDeleteModalVisible] = useState(false);
    const [isAddDiscountModalVisible, setIsAddDiscountModalVisible] = useState(false);
    const [isChangeRoomModalVisible, setIsChangeRoomModalVisible] = useState(false);
    const [isEditAddonsModalVisible, setIsEditAddonsModalVisible] = useState(false);
    const [addOns, setAddOns] = useState({});
    const [bookings, setBookings] = useState([]);
    const [selectedRoomForAddons, setSelectedRoomForAddons] = useState(null);
    const [additionalGuests, setAdditionalGuests] = useState([]);
    const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
    const [addOnPrices, setAddOnPrices] = useState({ mattress: 0, breakfast: 0 });
    const [isAdditionalGuestModalOpen, setIsAdditionalGuestModalOpen] = useState(false);
    const [isOfferModalOpen, setIsOfferModalOpen] = useState(false); // State for offer modal
    const isCheckedIn = bookingData?.checkinStatus && !bookingData?.checkoutStatus;
    const isCheckedOut = bookingData?.checkinStatus && bookingData?.checkoutStatus;
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
    const [transactionsUpdated, setTransactionsUpdated] = useState(false); // State to trigger re-render
    const [selectedGuest, setSelectedGuest] = useState(null);
    const [recalculate, setRecalculate] = useState(false);
    //const [isLoading, setIsLoading] = useState(false);
    //const [bookings, setBookings] = useState([]);
    //const [bookingData, setBookingData] = useState(null);
    const [cal, setCal] = useState([]);
    //const [error, setError] = useState(null);

    //const [cal, setcal] = useState([])
    const bg = useColorModeValue('white', 'gray.800');
    const textColor = useColorModeValue('gray.800', 'white');
    const borderColor = useColorModeValue('gray.200', 'gray.600');
    const headerBg = useColorModeValue('blue.500', 'blue.200');
    const headerTextColor = useColorModeValue('white', 'gray.800');
    const cardBg = useColorModeValue('white', 'gray.700');
    const hoverBg = useColorModeValue('gray.100', 'gray.600');
    const pageBackground = useColorModeValue(
        "linear(to-br, blue.100, purple.100)",
        "linear(to-br, blue.900, purple.900)"
    );
    const [transactions, setTransactions] = useState([]);

    const menuBg = useColorModeValue('white', 'gray.700');
    const menuTextColor = useColorModeValue('gray.800', 'white');

    //   const fetchBookingData = useCallback(async () => {
    //     setIsLoading(true);
    //     try {
    //         const url = groupId
    //             ? `http://ec2-54-211-23-206.compute-1.amazonaws.com:8081/reservation/getGroupSummary?groupId=${groupId}`
    //             : `http://ec2-54-211-23-206.compute-1.amazonaws.com:8081/reservation/getSummary?bookingId=${bookingId}`;
    //         const response = await fetch(url, {
    //             headers: { 'Authorization': `Bearer ${authToken}` }
    //         });
    //         if (!response.ok) throw new Error('Failed to fetch booking data');
    //         const data = await response.json();
    //         if (Array.isArray(data)) {
    //             setBookings(data);
    //             setBookingData(data[0]); // Set the first booking as the main booking data
    //         } else {
    //             setBookings([data]);
    //             setBookingData(data);
    //         }
    //         console.log('cal data', data)
    //         setcal([data])
    //         setError(null);
    //     } catch (err) {
    //         setError(err.message);
    //         toast({
    //             title: "Error",
    //             description: "Failed to fetch updated booking data. Please try again.",
    //             status: "error",
    //             duration: 5000,
    //             isClosable: true,
    //         });
    //     } finally {
    //         setIsLoading(false);
    //     }
    // }, [authToken, bookingId, groupId, toast]);


    const fetchBookingData = useCallback(async () => {
        setIsLoading(true);
        try {
            // Determine the URL based on whether it's a group booking or individual booking
            const bookingUrl = groupId
                ? `http://ec2-54-211-23-206.compute-1.amazonaws.com:8081/reservation/getGroupSummary?groupId=${groupId}`
                : `http://ec2-54-211-23-206.compute-1.amazonaws.com:8081/reservation/getSummary?bookingId=${bookingId}`;

            // Fetch booking data
            const bookingResponse = await fetch(bookingUrl, {
                headers: { 'Authorization': `Bearer ${authToken}` }
            });

            if (!bookingResponse.ok) {
                throw new Error('Failed to fetch booking data');
            }

            const bookingData = await bookingResponse.json();

            // Update bookings state
            if (Array.isArray(bookingData)) {
                setBookings(bookingData);
                setBookingData(bookingData[0]); // Set the first booking as the main booking data
            } else {
                setBookings([bookingData]);
                setBookingData(bookingData);
            }

            // Fetch transactions
            const transactionsUrl = groupId
                ? `http://ec2-54-211-23-206.compute-1.amazonaws.com:8081/billing/getAllGroupTransactions?groupId=${groupId}`
                : `http://ec2-54-211-23-206.compute-1.amazonaws.com:8081/billing/getAllTransactions?bookingId=${bookingId}`;

            const transactionsResponse = await fetch(transactionsUrl, {
                headers: { 'Authorization': `Bearer ${authToken}` }
            });

            if (!transactionsResponse.ok) {
                throw new Error('Failed to fetch transactions');
            }

            const transactionsData = await transactionsResponse.json();
            setTransactions(transactionsData);

            // Fetch additional guests if it's not a group booking
            if (!groupId && bookingData.bookingId) {
                const guestsResponse = await fetch(
                    `http://ec2-54-211-23-206.compute-1.amazonaws.com:8081/guests/getByBookingId?bookingId=${bookingData.bookingId}`,
                    {
                        headers: { 'Authorization': `Bearer ${authToken}` }
                    }
                );

                if (guestsResponse.ok) {
                    const guestsData = await guestsResponse.json();
                    setAdditionalGuests(guestsData);
                } else {
                    console.error('Failed to fetch additional guests');
                }
            }

            // Fetch add-on prices
            const addOnsResponse = await fetch('http://ec2-54-211-23-206.compute-1.amazonaws.com:8081/addOns/getAll', {
                headers: { 'Authorization': `Bearer ${authToken}` }
            });

            if (addOnsResponse.ok) {
                const addOnsData = await addOnsResponse.json();
                const prices = {};
                addOnsData.forEach(item => prices[item.name.toLowerCase()] = item.cost);
                setAddOnPrices(prices);
            } else {
                console.error('Failed to fetch add-on prices');
            }

            setError(null);
        } catch (err) {
            setError(err.message);
            toast({
                title: "Error",
                description: "Failed to fetch updated booking data. Please try again.",
                status: "error",
                duration: 5000,
                isClosable: true,
            });
        } finally {
            setIsLoading(false);
        }
    }, [authToken, bookingId, groupId, toast]);

    const fetchAdditionalGuests = useCallback(async (bookingId) => {
        try {
            const response = await fetch(
                `http://ec2-54-211-23-206.compute-1.amazonaws.com:8081/guests/getByBookingId?bookingId=${bookingId}`,
                {
                    headers: {
                        'Authorization': `Bearer ${authToken}`
                    }
                }
            );
            if (!response.ok) throw new Error('Failed to fetch additional guests');
            const data = await response.json();
            setAdditionalGuests(data);
        } catch (err) {
            console.error("Failed to fetch additional guests:", err);
        }
    }, [authToken]);

    // useEffect(() => {
    //   fetchBookingData();
    // }, [fetchBookingData]);

    useEffect(() => {
        if (bookingData) {
            fetchAdditionalGuests(bookingData.bookingId);
        }
    }, [bookingData, fetchAdditionalGuests]);

    //
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


    const calculateBillingSummary = useCallback(() => {
        if (!bookings.length || !addOnPrices.breakfast || !addOnPrices.mattress) return;

        console.log('Calculating Billing Summary with Bookings data:', bookings);

        const calculateTotal = (key) => bookings.reduce((total, booking) => total + (booking[key] || 0), 0);

        let roomCharges = calculateTotal('roomTotal');
        let addOnCharges = 0;
        let foodBill = calculateTotal('foodAmount');
        let discount = calculateTotal('discount');
        let offerDiscount = calculateTotal('offerDiscount') || 0;
        let gstAmount = calculateTotal('gstAmount');

        bookings.forEach(booking => {
            const days = moment(booking.checkOut).diff(moment(booking.checkIn), 'days');
            // Add breakfast cost to room charges
            roomCharges += (booking.addOnMap.breakfast || 0) * addOnPrices.breakfast;
            // Calculate mattress cost as add-on charges
            addOnCharges += (booking.addOnMap.mattress || 0) * addOnPrices.mattress;
        });

        let subtotal = roomCharges + addOnCharges + foodBill - discount - offerDiscount;
        let grossAmount = subtotal + gstAmount;
        let amountPaid = calculateTotal('paidAmt');
        let amountPending = grossAmount - amountPaid;

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
            amountPending
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
            amountPending
        });
    }, [bookings, addOnPrices]);

    useEffect(() => {
        if (bookings.length > 0 && Object.keys(addOnPrices).length > 0) {
            calculateBillingSummary();
        }
    }, [bookings, addOnPrices, transactions, calculateBillingSummary]);

    // useEffect(() => {
    //   if (bookings.length > 0 && Object.keys(addOnPrices).length > 0 && transactions.length > 0) {
    //     calculateBillingSummary();
    //   }
    // }, [bookings, addOnPrices, transactions, calculateBillingSummary]);


    useEffect(() => {
        if (bookings.length > 0 && Object.keys(addOnPrices).length > 0) {
            calculateBillingSummary();
        }
    }, [bookings, addOnPrices, transactions, calculateBillingSummary]);

    //
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



        const fetchTransactions = async () => {
            try {
                const url = groupId
                    ? `http://ec2-54-211-23-206.compute-1.amazonaws.com:8081/billing/getAllGroupTransactions?groupId=${groupId}`
                    : `http://ec2-54-211-23-206.compute-1.amazonaws.com:8081/billing/getAllTransactions?bookingId=${bookingId}`;

                const response = await fetch(url, {
                    headers: { 'Authorization': `Bearer ${authToken}` }
                });
                const data = await response.json();
                setTransactions(data);
            } catch (error) {
                console.error('Error fetching transactions:', error);
            }
        };

        fetchAddOnPrices();
        fetchTransactions();
    }, [authToken, groupId, bookingId]);

    useEffect(() => {
        const fetchTransactions = async () => {
            try {
                const url = groupId
                    ? `http://ec2-54-211-23-206.compute-1.amazonaws.com:8081/billing/getAllGroupTransactions?groupId=${groupId}`
                    : `http://ec2-54-211-23-206.compute-1.amazonaws.com:8081/billing/getAllTransactions?bookingId=${bookingId}`;

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
    }, [groupId, bookingId, authToken]);

    const handleExtendBooking = () => setIsExtendModalOpen(true);
    const handleEditGuest = () => setIsEditGuestModalVisible(true);
    //const handleCancelDeleteBooking = () => setIsCancelDeleteModalVisible(true);
    const handleAddDiscount = () => setIsAddDiscountModalVisible(true);
    const handleAddOffer = () => setIsOfferModalOpen(true); // Function to handle offer modal open

    const handleExtendSuccess = async (message) => {
        toast({
            title: "Booking Extended",
            description: message,
            status: "success",
            duration: 5000,
            isClosable: true,
        });
        await fetchBookingData();
        setIsExtendModalOpen(false);
    };

    const handleGuestUpdate = async () => {
        await fetchBookingData();
        setIsEditGuestModalVisible(false);
        toast({
            title: "Success",
            description: "Guest details updated successfully",
            status: "success",
            duration: 3000,
            isClosable: true,
        });
    };

    useEffect(() => {
        fetchBookingData();
    }, [fetchBookingData, transactionsUpdated]); // Include transactionsUpdated here

    //   const handleBookingCancelDelete = async () => {
    //     await fetchBookingData();
    //     setIsCancelDeleteModalVisible(false);
    //     history.push("/view-bookings");
    //   };
    const handleBookingCancelDelete = async () => {
        setIsCancelDeleteModalVisible(false);
        //await fetchBookingData();
        history.push("/bookings");
    };

    const handleDiscountAdd = async (discountAmount) => {
        await fetchBookingData();
        setIsAddDiscountModalVisible(false);
        toast({
            title: "Success",
            description: `Discount of ₹${discountAmount} added successfully`,
            status: "success",
            duration: 3000,
            isClosable: true,
        });
    };

    const convertTo12HourFormat = (time24) => {
        if (!time24) return ''; // Handle undefined or null cases

        let [hours, minutes] = time24.split(':'); // Use let instead of const
        hours = parseInt(hours, 10);
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12 || 12; // Convert '0' hour to '12' for 12-hour clock
        return `${hours}:${minutes} ${ampm}`;
    };



    const handleGenerateInvoice = () => {
        const isGroupBooking = Array.isArray(bookingData);
        const bookingDetails = isGroupBooking ? bookingData[0] : bookingData;

        const checkInTime12Hour = convertTo12HourFormat(bookingDetails.checkInTime);
        const checkOutTime12Hour = convertTo12HourFormat(bookingDetails.checkOutTime);
        const formatDate = (date) => moment(date).format('YYYY-MM-DD');
        const formatTime = (time) => moment(time, 'HH:mm:ss').format('h:mm A');

        // Calculate CGST and SGST
        const totalGST = billingSummary.gstAmount;
        const cgst = totalGST / 2;
        const sgst = totalGST / 2;

        history.push({
            pathname: '/invoice',
            state: {
                bookingId: isGroupBooking ? null : bookingDetails.bookingId,
                groupId: isGroupBooking ? bookingDetails.groupId : null,
                customerName: bookingDetails.customerName,
                email: bookingDetails.email,
                phone: bookingDetails.phoneNumber,
                gstNumber: bookingDetails.gstNumber,
                checkIn: formatDate(bookingDetails.checkIn),
                checkInTime: formatTime(bookingDetails.checkInTime),
                checkOutTime: formatTime(bookingDetails.checkOutTime),
                checkOut: formatDate(bookingDetails.checkOut),
                bookingDetails: isGroupBooking ? bookingData[0] : bookingData,
                billingSummary: {
                    ...billingSummary,
                    cgst: cgst,
                    sgst: sgst
                },
                roomNumber: isGroupBooking ? null : bookingData.roomNumber
            },
        });
    };


    const handleChangeRoom = () => {
        if (!bookingData) {
            toast({
                title: "Error",
                description: "Booking data is not available",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
            return;
        }
        setIsChangeRoomModalVisible(true);
    };

    const handleEditAddons = (roomNumber) => {
        const selectedBooking = bookings.find(booking => booking.roomNumber === roomNumber);
        if (selectedBooking) {
            setSelectedRoomForAddons(selectedBooking);
            setIsEditAddonsModalVisible(true);
        } else {
            toast({
                title: "Error",
                description: "Room data not found",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        }
    };

    const handleTransactionsUpdated = useCallback(() => {
        fetchBookingData().then(() => calculateBillingSummary());
    }, [fetchBookingData, calculateBillingSummary]);


    const handleCreateTask = (roomNumber) => {
        setSelectedRoom(roomNumber);
        setIsTaskModalOpen(true);
    };

    const handleAddonsUpdated = async (updatedAddOns) => {
        await fetchBookingData();
        setIsEditAddonsModalVisible(false);
        toast({
            title: "Add-ons Updated",
            description: "Add-ons successfully updated",
            status: "success",
            duration: 3000,
            isClosable: true,
        });
    };

    const handleRoomChanged = async (newRoomNumber) => {
        await fetchBookingData();
        toast({
            title: "Room Changed",
            description: `Room successfully changed to ${newRoomNumber}`,
            status: "success",
            duration: 3000,
            isClosable: true,
        });
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

    const handleCheckOut = () => {
        history.push('/combined-settlement', {
            customerId: isGroupBooking ? null : bookingData.bookingId,
            groupId: isGroupBooking ? groupId : null,
        }
        );
    };

    const handleGroupCheckIn = async () => {
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

    const handleGroupCheckOut = async () => {
        try {
            for (const booking of bookings) {
                await fetch(
                    `http://ec2-54-211-23-206.compute-1.amazonaws.com:8081/roomStatus/checkOut?bookingId=${booking.bookingId}`,
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
                description: "Group check-out successful",
                status: "success",
                duration: 3000,
                isClosable: true
            });
        } catch (error) {
            toast({
                title: "Error",
                description: "An error occurred during group check-out.",
                status: "error",
                duration: 3000,
                isClosable: true
            });
        }
    };

    const handleAddTransaction = () => {
        setIsTransactionModalOpen(true);
    };

    const handleTransactionModalClose = async () => {
        setIsTransactionModalOpen(false);
        await fetchBookingData();
        calculateBillingSummary();
    };


    const handleAddGuest = async (guestData) => {
        if (!guestData || !guestData.bookingId) {
            console.error('Guest data is missing or does not contain bookingId');
            return;
        }

        try {
            const response = await fetch(
                'http://ec2-54-211-23-206.compute-1.amazonaws.com:8081/guests/addList',
                {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${authToken}`,
                    },
                    body: JSON.stringify([guestData]),
                }
            );

            if (!response.ok) throw new Error('Failed to add guest');
            const data = await response.json();
            console.log('Success:', data);
            fetchBookingData();
            toast({
                title: 'Success',
                description: 'Guest added successfully',
                status: 'success',
                duration: 3000,
                isClosable: true,
            });
        } catch (error) {
            console.error('Error:', error);
            toast({
                title: 'Error',
                description: 'Failed to add guest',
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
        }
    };

    const handleDeleteGuest = async (guestId) => {
        try {
            const response = await fetch(
                `http://ec2-54-211-23-206.compute-1.amazonaws.com:8081/guests/delete?bookingId=${bookingData.bookingId}&guestId=${guestId}`,
                {
                    method: "DELETE",
                    headers: {
                        "Content-Type": "application/json",
                        'Authorization': `Bearer ${authToken}`
                    },
                }
            );

            if (response.status === 200) {
                console.log(`Guest with guestId ${guestId} deleted successfully`);
                fetchAdditionalGuests(bookingData.bookingId);
                toast({
                    title: "Success",
                    description: "Guest deleted successfully",
                    status: "success",
                    duration: 3000,
                    isClosable: true,
                });
            } else if (response.status === 404) {
                console.error(`Guest with guestId ${guestId} not found`);
                toast({
                    title: "Error",
                    description: "Guest not found",
                    status: "error",
                    duration: 3000,
                    isClosable: true,
                });
            } else {
                console.error(`Error deleting guest with guestId ${guestId}`);
                toast({
                    title: "Error",
                    description: "Failed to delete guest",
                    status: "error",
                    duration: 3000,
                    isClosable: true,
                });
            }
        } catch (error) {
            console.error("Error deleting guest:", error);
            toast({
                title: "Error",
                description: "Failed to delete guest",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        }
    };

    const handleCancelDeleteBooking = () => {
        setIsCancelDeleteModalVisible(true);
    };

    // const calculateStatus = (bookingDetails) => {
    //   if (bookingDetails.cancelStatus) return "Cancelled";
    //   if (!bookingDetails.checkIn) return "Unknown";

    //   const currentMoment = moment();
    //   const checkinMoment = moment(bookingDetails.checkIn);
    //   const checkoutMoment = moment(bookingDetails.checkOut + 'T' + bookingDetails.checkOutTime);
    //   const twoHoursBeforeCheckout = checkoutMoment.clone().subtract(2, 'hours');
    //   const bookingStatus = "Unknown";

    //   if (bookingDetails.checkinStatus && !bookingDetails.checkoutStatus) {
    //     if (currentMoment.isBefore(checkinMoment)) {
    //       bookingStatus = "Due in";
    //     } else if (currentMoment.isBetween(checkinMoment, checkoutMoment, null, '[]')) {
    //       if (currentMoment.isSameOrAfter(twoHoursBeforeCheckout)) {
    //         bookingStatus = "Due Out";
    //       } else {
    //         bookingStatus = "Occupied";
    //       }
    //     } else if (currentMoment.isAfter(checkoutMoment)) {
    //       bookingStatus = "Due Out";
    //     }
    //   } else if (!bookingDetails.checkinStatus && !bookingDetails.checkoutStatus) {
    //     bookingStatus = "Reserved";
    //   } else if (bookingDetails.checkinStatus && bookingDetails.checkoutStatus) {
    //     bookingStatus = "Checked out";
    //   }

    //   return bookingStatus;
    // };

    const calculateStatus = (bookingDetails) => {
        if (bookingDetails.cancelStatus) return "Cancelled";
        if (!bookingDetails.checkIn) return "Unknown";

        const currentMoment = moment();
        const checkinMoment = moment(bookingDetails.checkIn);
        const checkoutMoment = moment(bookingDetails.checkOut + 'T' + bookingDetails.checkOutTime);
        const twoHoursBeforeCheckout = checkoutMoment.clone().subtract(2, 'hours');
        let bookingStatus = "Unknown"; // Changed from const to let

        if (bookingDetails.checkinStatus && !bookingDetails.checkoutStatus) {
            if (currentMoment.isBefore(checkinMoment)) {
                bookingStatus = "Due in";
            } else if (currentMoment.isBetween(checkinMoment, checkoutMoment, null, '[]')) {
                if (currentMoment.isSameOrAfter(twoHoursBeforeCheckout)) {
                    bookingStatus = "Due Out";
                } else {
                    bookingStatus = "Occupied";
                }
            } else if (currentMoment.isAfter(checkoutMoment)) {
                bookingStatus = "Due Out";
            }
        } else if (!bookingDetails.checkinStatus && !bookingDetails.checkoutStatus) {
            bookingStatus = "Reserved";
        } else if (bookingDetails.checkinStatus && bookingDetails.checkoutStatus) {
            bookingStatus = "Checked out";
        }

        return bookingStatus;
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Due in':
                return 'yellow';
            case 'Occupied':
                return 'green';
            case 'Due Out':
                return 'orange';
            case 'Reserved':
                return 'blue';
            case 'Checked out':
                return 'gray';
            case 'Cancelled':
                return 'red';
            default:
                return 'gray';
        }
    };

    const renderHeaderCard = () => (
        <Flex
            bg={headerBg}
            color={headerTextColor}
            p={4}
            borderRadius="15px"
            boxShadow="0 4px 6px rgba(0, 0, 0, 0.1)"
            mb={6}
            alignItems="center"
        >
            <Button variant="ghost" color={headerTextColor} onClick={() => history.goBack()}>
                <ChevronLeftIcon />
                Back
            </Button>
            <Heading size="md" ml={4}>
                {isGroupBooking ? `Group Booking ID: #${groupId}` : `Booking ID: #${bookingId}`}
            </Heading>
            <Spacer />
            <Menu>
                <MenuButton as={Button} rightIcon={<ChevronDownIcon />} bg={menuBg} color={menuTextColor}>
                    Options
                </MenuButton>
                <MenuList bg={menuBg} color={menuTextColor}>
                    <MenuItem icon={<FaPlus />} onClick={() => handleCreateTask(bookingData.roomNumber)}>Add Task</MenuItem>
                    <MenuItem icon={<FaPercent />} onClick={handleAddDiscount}>Add Discount</MenuItem>
                    <MenuItem icon={<FaCalendarAlt />} onClick={handleExtendBooking}>Extend Booking</MenuItem>
                    <MenuItem icon={<FaFileInvoice />} onClick={handleGenerateInvoice}>Generate Invoice</MenuItem>
                    <MenuItem icon={<FaTrash />} onClick={handleCancelDeleteBooking}>Cancel/Delete Booking</MenuItem>
                    <MenuItem icon={<FaPercent />} onClick={handleAddOffer}>Add Offers</MenuItem>
                </MenuList>
            </Menu>
        </Flex>
    );

    const renderGuestCard = (booking) => (
        <Box
            bg={cardBg}
            borderRadius="15px"
            boxShadow="0 4px 6px rgba(0, 0, 0, 0.1)"
            p={6}
            mb={6}
        >
            <Flex alignItems="center" mb={4}>
                <Icon as={FaUser} mr={2} color={textColor} />
                <Heading size="md" color={textColor}>{booking.title} {booking.customerName}</Heading>
                <Spacer />
                <IconButton
                    icon={<EditIcon />}
                    aria-label="Edit booking"
                    size="sm"
                    variant="ghost"
                    onClick={handleEditGuest}
                />
            </Flex>
            <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                <HStack>
                    <Icon as={EmailIcon} color="gray.500" />
                    <Text color={textColor}>{booking.email || 'N/A'}</Text>
                </HStack>
                <HStack>
                    <Icon as={PhoneIcon} color="gray.500" />
                    <Text color={textColor}>{booking.phoneNumber}</Text>
                </HStack>
                <HStack>
                    <Icon as={FaUsers} color="gray.500" />
                    <Text color={textColor}>Guests: {booking.totalGuestCount}</Text>
                </HStack>
                <HStack>
                    <Icon as={CalendarIcon} color="gray.500" />
                    <Text color={textColor}>Age: {booking.age || 'N/A'}</Text>
                </HStack>
                <HStack gridColumn="1 / -1">
                    <Icon as={FaGlobe} color="gray.500" />
                    <Text color={textColor}>{booking.address}, {booking.city}, {booking.state}, {booking.country}</Text>
                    <Spacer />
                    <Icon as={FaIdCard} color="gray.500" />
                    <Text color={textColor}>{booking.customerDocs && Object.keys(booking.customerDocs)[0]}: {booking.customerDocs && Object.values(booking.customerDocs)[0]}</Text>
                </HStack>
            </Grid>
        </Box>
    );


    const RoomCard = ({
        booking,
        onChangeRoom,
        onEditAddons,
        additionalGuests,
        onAddGuest,
        onDeleteGuest,
        onEditGuest,
        authToken,
        selectedRoom,
        setSelectedRoom
    }) => {
        const [showAdditionalGuests, setShowAdditionalGuests] = useState(false);
        const [isAddGuestModalOpen, setIsAddGuestModalOpen] = useState(false);
        const [editingGuest, setEditingGuest] = useState(null);
        const [selectedGuest, setSelectedGuest] = useState(null);
        const status = calculateStatus(booking);

        const roomAdditionalGuests = additionalGuests.filter(
            guest => guest.bookingId === booking.bookingId
        );

        const cardBg = useColorModeValue('white', 'gray.700');
        const textColor = useColorModeValue('black', 'white');
        const menuBg = useColorModeValue('white', 'gray.700');
        const menuTextColor = useColorModeValue('black', 'white');
        const guestCardBg = useColorModeValue('gray.100', 'gray.800');
        const guestInfoColor = useColorModeValue('gray.600', 'gray.400');

        console.log('booking', booking);
        console.log('bookingId', booking.bookingId);

        return (
            <Box
                key={booking.bookingId}
                bg={cardBg}
                borderRadius="xl"
                boxShadow="md"
                p={6}
                mb={6}
                transition="all 0.3s"
                _hover={{ boxShadow: 'lg' }}
            >
                <Flex alignItems="center" mb={4}>
                    <Icon as={FaHotel} mr={2} color={textColor} boxSize={6} />
                    <Heading size="md" color={textColor}>
                        Room {booking.roomNumber}
                    </Heading>
                    <Badge
                        ml={2}
                        colorScheme={booking.roomType === 'AC' ? 'green' : 'blue'}
                        fontSize="0.8em"
                        borderRadius="full"
                        px={2}
                    >
                        {booking.roomType}
                    </Badge>
                    <Spacer />
                    <Badge
                        colorScheme={getStatusColor(status)}
                        fontSize="0.8em"
                        borderRadius="full"
                        px={2}
                    >
                        {status}
                    </Badge>
                    <Menu>
                        <MenuButton
                            as={IconButton}
                            aria-label="Options"
                            icon={<FaEllipsisV />}
                            variant="ghost"
                            size="sm"
                            ml={2}
                        />
                        <MenuList bg={menuBg} color={menuTextColor}>
                            <MenuItem
                                icon={<RepeatIcon />}
                                onClick={() => onChangeRoom(booking.bookingId)}
                            >
                                Change Room
                            </MenuItem>
                            <MenuItem
                                icon={<EditIcon />}
                                onClick={() => onEditAddons(booking.roomNumber)}
                            >
                                Edit Add-ons
                            </MenuItem>
                        </MenuList>
                    </Menu>
                </Flex>
                <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                    <HStack>
                        <Icon as={FaCalendarAlt} color="gray.500" />
                        <Text color={textColor}>
                            Check-in:{' '}
                            {moment(
                                `${booking.checkIn} ${booking.checkInTime}`
                            ).format("D MMM 'YY hh:mm A")}
                        </Text>
                    </HStack>
                    <HStack>
                        <Icon as={FaCalendarAlt} color="gray.500" />
                        <Text color={textColor}>
                            Check-out:{' '}
                            {moment(
                                `${booking.checkOut} ${booking.checkOutTime}`
                            ).format("D MMM 'YY hh:mm A")}
                        </Text>
                    </HStack>
                    <HStack>
                        <Icon as={FaInfo} color="gray.500" />
                        <Text color={textColor}>
                            Add-ons: Mattress ({booking.addOnMap.mattress}), Breakfast (
                            {booking.addOnMap.breakfast})
                        </Text>
                    </HStack>
                    <HStack>
                        <Icon as={FaMoneyBillWave} color="gray.500" />
                        <Text color={textColor}>
                            Pricing:{' '}
                            {booking.toggleRoomType
                                ? `${booking.toggleRoomType} (Changed)`
                                : 'Standard'}
                        </Text>
                    </HStack>
                </Grid>
                <Box mt={4}>
                    <Flex alignItems="center" mb={2}>
                        <Heading size="sm" color={textColor}>
                            Additional Guests ({roomAdditionalGuests.length})
                        </Heading>
                        <Spacer />
                        <Button
                            rightIcon={showAdditionalGuests ? <ChevronUpIcon /> : <ChevronDownIcon />}
                            onClick={() => setShowAdditionalGuests(!showAdditionalGuests)}
                            size="sm"
                            variant="ghost"
                            mr={2}
                        >
                            {showAdditionalGuests ? 'Hide' : 'Show'}
                        </Button>
                        <Button
                            leftIcon={<AddIcon />}
                            size="sm"
                            colorScheme="blue"
                            onClick={() => {
                                setSelectedGuest(null); // To add a new guest
                                setIsAddGuestModalOpen(true);
                            }}
                        >
                            Add Guest
                        </Button>
                    </Flex>
                    <Collapse in={showAdditionalGuests}>
                        <VStack align="stretch" spacing={3}>
                            {roomAdditionalGuests.map(guest => (
                                <Flex
                                    key={guest.guestId}
                                    bg={guestCardBg}
                                    p={3}
                                    borderRadius="md"
                                    alignItems="center"
                                    boxShadow="sm"
                                >
                                    <Avatar
                                        size="sm"
                                        name={`${guest.firstName} ${guest.lastName}`}
                                        mr={3}
                                    />
                                    <Box flex="1">
                                        <Text fontWeight="semibold">
                                            {guest.title} {guest.firstName} {guest.lastName}
                                        </Text>
                                        <HStack spacing={4} fontSize="sm" color={guestInfoColor}>
                                            <Flex align="center">
                                                <Icon as={FaBirthdayCake} mr={1} />
                                                <Text>{guest.age} years</Text>
                                            </Flex>
                                            <Flex align="center">
                                                <Icon as={FaPhone} mr={1} />
                                                <Text>{guest.phoneNumber}</Text>
                                            </Flex>
                                            <Flex align="center">
                                                <Icon as={FaEnvelope} mr={1} />
                                                <Text>{guest.email}</Text>
                                            </Flex>
                                        </HStack>
                                    </Box>
                                    <HStack>
                                        <Tooltip label="Edit Guest">
                                            <IconButton
                                                icon={<EditIcon />}
                                                aria-label="Edit guest"
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => {
                                                    setEditingGuest(guest);
                                                    setIsAddGuestModalOpen(true);
                                                }}
                                            />
                                        </Tooltip>
                                        <Tooltip label="Delete Guest">
                                            <IconButton
                                                icon={<DeleteIcon />}
                                                aria-label="Delete guest"
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => onDeleteGuest(guest.guestId)}
                                            />
                                        </Tooltip>
                                    </HStack>
                                </Flex>
                            ))}
                        </VStack>
                    </Collapse>
                </Box>
                <AdditionalGuestModal
                    isOpen={isAddGuestModalOpen}
                    onClose={() => setIsAddGuestModalOpen(false)}
                    guestData={selectedGuest}
                    bookingId={booking.bookingId}
                    authToken={authToken}
                    onSave={fetchBookingData} // Ensure fetchBookingData is called once
                />
            </Box>
        );
    };

    const TransactionCard = ({ billingSummary, transactions = [], onAddTransaction }) => {
        const [showTransactions, setShowTransactions] = useState(false);

        const cardBg = useColorModeValue('white', 'gray.700');
        const textColor = useColorModeValue('black', 'white');
        const borderColor = useColorModeValue('gray.200', 'gray.600');
        const transactionBg = useColorModeValue('gray.50', 'gray.800');

        return (
            <Box
                bg={cardBg}
                borderRadius="15px"
                boxShadow="0 4px 6px rgba(0, 0, 0, 0.1)"
                p={6}
                mb={6}
                transition="all 0.3s"
                _hover={{ boxShadow: "lg" }}
            >
                <Flex alignItems="center" mb={4}>
                    <Heading size="md" color={textColor}>Transactions</Heading>
                    <Spacer />
                    <Button leftIcon={<AddIcon />} size="sm" colorScheme="blue" onClick={onAddTransaction}>
                        Add Transaction
                    </Button>
                </Flex>
                <Grid templateColumns="repeat(3, 1fr)" gap={4} mb={4}>
                    <Text color={textColor}>Total Amount: ₹{Math.round(billingSummary.grossAmount)}</Text>
                    <Text color={textColor}>Paid Amount: ₹{Math.round(billingSummary.amountPaid)}</Text>
                    <Text color={textColor}>Pending Amount: ₹{Math.round(billingSummary.amountPending)}</Text>
                </Grid>
                {transactions.length > 0 && (
                    <Box>
                        <Flex alignItems="center" mb={2}>
                            <Heading size="sm" color={textColor}>Transaction History ({transactions.length})</Heading>
                            <Spacer />
                            <Button
                                rightIcon={showTransactions ? <ChevronUpIcon /> : <ChevronDownIcon />}
                                onClick={() => setShowTransactions(!showTransactions)}
                                size="sm"
                                variant="ghost"
                            >
                                {showTransactions ? 'Hide' : 'Show'}
                            </Button>
                        </Flex>
                        <Collapse in={showTransactions}>
                            {transactions.map((transaction, index) => (
                                <Box key={index} mt={2} p={4} borderWidth={1} borderRadius="md" borderColor={borderColor} bg={transactionBg}>
                                    <Text color={textColor} fontWeight="bold">Date: {transaction.paymentDate}</Text>
                                    <Text color={textColor}>Amount: ₹{Math.round(transaction.amountPaid)}</Text>
                                    <Text color={textColor}>Mode: {transaction.paymentMode}</Text>
                                </Box>
                            ))}
                        </Collapse>
                    </Box>
                )}
            </Box>
        );
    };


    if (isLoading) {
        return (
            <Box minHeight="100vh" p={5} bgGradient={pageBackground}>
                <VStack spacing={6} align="stretch" maxWidth="1200px" margin="auto">
                    <Skeleton height="60px" />
                    <Skeleton height="200px" />
                    <Skeleton height="200px" />
                </VStack>
            </Box>
        );
    }

    if (error) {
        return (
            <Box minHeight="100vh" p={5} bgGradient={pageBackground}>
                <VStack spacing={6} align="stretch" maxWidth="1200px" margin="auto">
                    <Heading color="red.500">Error</Heading>
                    <Text>{error}</Text>
                    <Button onClick={fetchBookingData} colorScheme="blue">Retry</Button>
                </VStack>
            </Box>
        );
    }


    console.log('transactions', transactions, addOnPrices)
    return (
        <Box minHeight="100vh" p={5} bgGradient={pageBackground}>
            <VStack spacing={6} align="stretch" maxWidth="1200px" margin="auto">
                {renderHeaderCard()}
                <Flex direction={{ base: "column", lg: "row" }} spacing={8}>
                    <Box flex="1" mr={{ base: 0, lg: 8 }} mb={{ base: 8, lg: 0 }}>
                        <VStack spacing={4} align="stretch">
                            {renderGuestCard(bookingData)}
                            {bookings.map(booking => (
                                <RoomCard
                                    key={booking.bookingId}
                                    booking={booking}
                                    onChangeRoom={handleChangeRoom}
                                    onEditAddons={handleEditAddons}
                                    additionalGuests={additionalGuests}
                                    onAddGuest={handleAddGuest}
                                    onDeleteGuest={handleDeleteGuest}
                                    onEditGuest={handleEditGuest}
                                    authToken={authToken}
                                    selectedRoom={selectedRoom}
                                    setSelectedRoom={setSelectedRoom}
                                />
                            ))}
                            <TransactionCard
                                billingSummary={billingSummary}
                                transactions={transactions}
                                onAddTransaction={handleAddTransaction}
                            />
                        </VStack>
                    </Box>
                    <Box width={{ base: "100%", lg: "300px" }}>
                        {/* <BillingSummary
              bookingData={isGroupBooking ? bookings : [bookingData]}
              transactions={transactions}
              addOnPrices={addOnPrices}
            /> */}
                        <BillingSummary
                            billingSummary={{
                                ...billingSummary,
                                roomCharges: billingSummary.roomCharges, // This now includes breakfast cost
                                addOnCharges: billingSummary.addOnCharges // This now only includes mattress cost
                            }}
                        />
                    </Box>
                </Flex>
                <Flex justifyContent="space-between" mt={8}>
                    {isGroupBooking ? (
                        <>
                            <Button
                                colorScheme="blue"
                                size="lg"
                                borderRadius="full"
                                px={8}
                                onClick={handleGroupCheckIn}
                                isDisabled={isCheckedIn || isCheckedOut}
                            >
                                Group Check-in
                            </Button>
                            <Button
                                colorScheme="red"
                                size="lg"
                                borderRadius="full"
                                px={8}
                                onClick={handleCheckOut}
                                isDisabled={!isCheckedIn || isCheckedOut}
                            >
                                Group Check-out
                            </Button>
                        </>
                    ) : (
                        <>
                            <Button
                                colorScheme="blue"
                                size="lg"
                                borderRadius="full"
                                px={8}
                                onClick={() => handleCheckIn(bookingData.bookingId)}
                                isDisabled={isCheckedIn || isCheckedOut}
                            >
                                Check-in
                            </Button>
                            <Button
                                colorScheme="red"
                                size="lg"
                                borderRadius="full"
                                px={8}
                                onClick={handleCheckOut}
                                isDisabled={!isCheckedIn || isCheckedOut}
                            >
                                Check-out
                            </Button>
                        </>
                    )}
                    <Button
                        colorScheme="green"
                        size="lg"
                        borderRadius="full"
                        px={8}
                        onClick={() => history.push('/combined-settlement', {
                            customerId: isGroupBooking ? null : bookingData.bookingId,
                            groupId: isGroupBooking ? groupId : null,
                            discount: bookingData.discount,
                            //billingSummary
                        })}
                    >
                        Settlement
                    </Button>
                </Flex>
            </VStack>

            {bookingData && (
                <>
                    <ExtendBooking
                        isOpen={isExtendModalOpen}
                        onClose={() => setIsExtendModalOpen(false)}
                        bookingData={bookings}
                        authToken={authToken}
                        onSuccess={handleExtendSuccess}
                    />
                    <EditGuestModal
                        visible={isEditGuestModalVisible}
                        onCancel={() => setIsEditGuestModalVisible(false)}
                        onSave={handleGuestUpdate}
                        guestData={bookingData}
                        authToken={authToken}
                        onAddGuest={handleAddGuest}
                    />
                    {/* <CancelDeleteBookingModal
            visible={isCancelDeleteModalVisible}
            onCancel={() => setIsCancelDeleteModalVisible(false)}
            onConfirm={handleBookingCancelDelete}
            guestData={selectedGuest}
          bookingId={bookingData.bookingId}
            authToken={authToken}
          /> */}
                    <CancelDeleteBookingModal
                        visible={isCancelDeleteModalVisible}
                        onCancel={() => setIsCancelDeleteModalVisible(false)}
                        onConfirm={handleBookingCancelDelete}
                        bookings={bookingData.bookingId}
                        groupId={isGroupBooking ? groupId : null}
                        authToken={authToken}
                    />
                    <AddDiscountModal
                        visible={isAddDiscountModalVisible}
                        onCancel={() => setIsAddDiscountModalVisible(false)}
                        onSave={handleDiscountAdd}
                        bookingId={bookingData.bookingId} // Ensure bookingData is defined and bookingId is passed
                        authToken={authToken}
                    />

                    <ChangeRoom
                        visible={isChangeRoomModalVisible}
                        onCancel={() => setIsChangeRoomModalVisible(false)}
                        onOk={() => setIsChangeRoomModalVisible(false)}
                        checkInDate={bookingData.checkIn}
                        checkInTime={bookingData.checkInTime}
                        checkOutDate={bookingData.checkOut}
                        checkOutTime={bookingData.checkOutTime}
                        authToken={authToken}
                        bookingId={bookingData.bookingId}  // Make sure this is the correct booking ID
                        onRoomChanged={handleRoomChanged}
                    />
                    {selectedRoomForAddons && (
                        <EditAddons
                            visible={isEditAddonsModalVisible}
                            onCancel={() => setIsEditAddonsModalVisible(false)}
                            onSave={handleAddonsUpdated}
                            bookingId={selectedRoomForAddons.bookingId}
                            authToken={authToken}
                            addOns={selectedRoomForAddons.addOnMap}
                            roomNumber={selectedRoomForAddons.roomNumber}
                        />
                    )}
                    <Modal isOpen={isTransactionModalOpen} onClose={handleTransactionModalClose} size="xl">
                        <ModalOverlay />
                        <ModalContent>
                            <ModalHeader>Add Transaction</ModalHeader>
                            <ModalCloseButton />
                            <ModalBody>
                                <UnifiedTransactionComponent
                                    bookingId={bookingData.bookingId}
                                    groupId={bookingData.groupId}
                                    authToken={authToken}
                                    // onTransactionsUpdated={() => setTransactionsUpdated(prev => !prev)} // Toggle state to trigger re-render
                                    onTransactionsUpdated={handleTransactionsUpdated} // Pass the callback

                                />

                            </ModalBody>
                        </ModalContent>
                    </Modal>
                    <AdditionalGuestModal
                        isOpen={isAdditionalGuestModalOpen}
                        onClose={() => setIsAdditionalGuestModalOpen(false)}
                        bookingId={bookingData.bookingId}
                        authToken={authToken}
                        onGuestsUpdated={fetchBookingData}
                    />
                    <TaskModal
                        isOpen={isTaskModalOpen}
                        onClose={() => setIsTaskModalOpen(false)}
                        task={{
                            taskName: 'Cleaning',
                            roomNumber: selectedRoom,
                        }}
                        onSave={fetchBookingData}
                        authToken={authToken}
                        bookings={isGroupBooking && bookings ? bookings : []}
                    />
                    <AddOffersModal
                        isOpen={isOfferModalOpen}
                        onClose={() => setIsOfferModalOpen(false)}
                        authToken={authToken}
                        bookingId={bookingData.bookingId}
                    />
                </>
            )}
        </Box>
    );
};

export default BookingConfirmation;