import React, { useState, useEffect } from 'react';
import {
    Box, VStack, HStack, Text, Button, Checkbox, Input, Select, Table, Thead, Tbody, Tr, Th, Td,
    useToast, Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton,
    useColorModeValue, Flex, Spacer, Badge, InputGroup, InputLeftElement, Tooltip, Stat, StatLabel,
    StatNumber, StatHelpText, StatArrow, IconButton, Switch
} from '@chakra-ui/react';
import { FaMoneyBillWave, FaCreditCard, FaMobile, FaCoins } from 'react-icons/fa';
import { InfoIcon, CheckIcon, CloseIcon } from '@chakra-ui/icons';
import axios from 'axios';
import moment from 'moment';

const ClearPaymentComponent = ({ selectedBooking, authToken, onClose, onPaymentCleared }) => {
    const [bookings, setBookings] = useState([]);
    const [selectedBookings, setSelectedBookings] = useState({});
    const [paymentMode, setPaymentMode] = useState('cash');
    const [isProcessing, setIsProcessing] = useState(false);
    const [selectAll, setSelectAll] = useState(true);
    const toast = useToast();

    const bgColor = useColorModeValue('white', 'gray.800');
    const textColor = useColorModeValue('gray.800', 'white');
    const borderColor = useColorModeValue('gray.200', 'gray.600');
    const hoverBg = useColorModeValue('gray.50', 'gray.700');

    useEffect(() => {
        if (selectedBooking.bookings) {
            setBookings(selectedBooking.bookings);
            initializeSelectedBookings(selectedBooking.bookings);
        } else if (selectedBooking.groupIds) {
            fetchGroupBookings();
        }
    }, [selectedBooking]);

    const initializeSelectedBookings = (bookingsData) => {
        const initialSelected = {};
        bookingsData.forEach(booking => {
            initialSelected[booking.bookingId] = {
                selected: true,
                amount: Math.round(booking.pendingAmt)
            };
        });
        setSelectedBookings(initialSelected);
    };

    const fetchGroupBookings = async () => {
        setIsProcessing(true);
        try {
            const promises = selectedBooking.groupIds.map(groupId => 
                axios.get(`http://ec2-54-211-23-206.compute-1.amazonaws.com:8081/reservation/getGroupSummary?groupId=${groupId}`, {
                    headers: { 'Authorization': `Bearer ${authToken}` },
                })
            );
            const responses = await Promise.all(promises);
            const fetchedBookings = responses.flatMap(response => response.data);
            setBookings(fetchedBookings);
            initializeSelectedBookings(fetchedBookings);
        } catch (error) {
            console.error('Error fetching group bookings:', error);
            toast({
                title: 'Error fetching bookings',
                description: 'Unable to fetch group bookings. Please try again.',
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
        } finally {
            setIsProcessing(false);
        }
    };

    const handleCheckboxChange = (bookingId) => {
        setSelectedBookings(prev => ({
            ...prev,
            [bookingId]: { ...prev[bookingId], selected: !prev[bookingId].selected }
        }));
    };

    const handleAmountChange = (bookingId, amount) => {
        setSelectedBookings(prev => ({
            ...prev,
            [bookingId]: { ...prev[bookingId], amount: Math.round(parseFloat(amount) || 0) }
        }));
    };

    const handleClearPayments = async () => {
        setIsProcessing(true);
        const selectedBookingsArray = Object.entries(selectedBookings)
            .filter(([_, value]) => value.selected)
            .map(([bookingId, value]) => ({ bookingId, amount: value.amount }));
    
        try {
            for (const booking of selectedBookingsArray) {
                const response = await axios.put(
                    'http://ec2-54-211-23-206.compute-1.amazonaws.com:8081/transaction/create',
                    {
                        bookingId: booking.bookingId,
                        amountPaid: booking.amount,
                        paymentMode: paymentMode,
                        date: moment().format('YYYY-MM-DD')
                    },
                    {
                        headers: {
                            'Authorization': `Bearer ${authToken}`,
                            'Content-Type': 'application/json',
                        },
                    }
                );
    
                // Assuming the response data contains a success message
                if (response.data && typeof response.data === 'string' && response.data.startsWith('Transaction added!')) {
                    const clearedBooking = {
                        customerName: selectedBooking.customerName,
                        amountCleared: booking.amount,
                    };
                    onPaymentCleared(clearedBooking, selectedBooking.groupIds !== undefined);
                } else {
                    throw new Error('Unexpected response format');
                }
            }
    
            toast({
                title: 'Payments cleared successfully',
                status: 'success',
                duration: 3000,
                isClosable: true,
            });
    
            onClose();
        } catch (error) {
            console.error('Error clearing payments:', error);
            toast({
                title: 'Error clearing payments',
                description: 'An error occurred while clearing payments. Please try again.',
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
        } finally {
            setIsProcessing(false);
        }
    };
    

    const getTotalSelectedAmount = () => {
        return Object.values(selectedBookings)
            .filter(booking => booking.selected)
            .reduce((total, booking) => total + booking.amount, 0);
    };

    const getPaymentModeIcon = (mode) => {
        switch (mode) {
            case 'cash': return <FaCoins />;
            case 'online': return <FaMobile />;
            case 'creditCard': return <FaCreditCard />;
            case 'upi': return <FaMoneyBillWave />;
            default: return <FaCoins />;
        }
    };

    const handleSelectAllToggle = () => {
        setSelectAll(!selectAll);
        setSelectedBookings(prev => {
            const updated = {};
            Object.keys(prev).forEach(bookingId => {
                updated[bookingId] = { ...prev[bookingId], selected: !selectAll };
            });
            return updated;
        });
    };

    return (
        <Modal isOpen={true} onClose={onClose} size="4xl">
            <ModalOverlay />
            <ModalContent bg={bgColor}>
                <ModalHeader color={textColor}>
                    <Flex alignItems="center">
                        <Text>Clear Payments</Text>
                        <Spacer />
                        <Badge colorScheme="blue" fontSize="0.8em" p={2} borderRadius="full">
                            {selectedBooking.bookings ? 'Single Booking' : 'Group Booking'}
                        </Badge>
                    </Flex>
                </ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <VStack spacing={6} align="stretch">
                        <Flex justifyContent="space-between" alignItems="center">
                            <Stat>
                                <StatLabel>Total Selected Amount</StatLabel>
                                <StatNumber>₹{getTotalSelectedAmount()}</StatNumber>
                                <StatHelpText>
                                    <StatArrow type={getTotalSelectedAmount() >= 0 ? 'increase' : 'decrease'} />
                                    {Math.abs(getTotalSelectedAmount())}
                                </StatHelpText>
                            </Stat>
                            <Box>
                                <Text mb={2}>Payment Mode:</Text>
                                <Select 
                                    value={paymentMode} 
                                    onChange={(e) => setPaymentMode(e.target.value)}
                                    icon={getPaymentModeIcon(paymentMode)}
                                    width="150px"
                                >
                                    <option value="cash">Cash</option>
                                    <option value="online">Online</option>
                                    <option value="creditCard">Credit Card</option>
                                    <option value="upi">UPI</option>
                                </Select>
                            </Box>
                        </Flex>
                        <Flex justifyContent="space-between" alignItems="center">
                            <Text>Select All</Text>
                            <Switch isChecked={selectAll} onChange={handleSelectAllToggle} colorScheme="blue" />
                        </Flex>
                        <Box overflowX="auto">
                            <Table variant="simple" size="sm">
                                <Thead>
                                    <Tr>
                                        <Th>Select</Th>
                                        <Th>Booking ID</Th>
                                        <Th>Pending</Th>
                                        <Th>Clear Amount</Th>
                                        <Th>Status</Th>
                                    </Tr>
                                </Thead>
                                <Tbody>
                                    {bookings.map((booking) => (
                                        <Tr key={booking.bookingId} _hover={{ bg: hoverBg }}>
                                            <Td>
                                                <Checkbox 
                                                    isChecked={selectedBookings[booking.bookingId]?.selected}
                                                    onChange={() => handleCheckboxChange(booking.bookingId)}
                                                    colorScheme="blue"
                                                />
                                            </Td>
                                            <Td>{booking.bookingId}</Td>
                                            <Td>₹{Math.round(booking.pendingAmt)}</Td>
                                            <Td>
                                                <InputGroup size="sm">
                                                    <InputLeftElement pointerEvents="none" color="gray.300" fontSize="1em" children="₹" />
                                                    <Input 
                                                        type="number"
                                                        value={selectedBookings[booking.bookingId]?.amount || ''}
                                                        onChange={(e) => handleAmountChange(booking.bookingId, e.target.value)}
                                                        isDisabled={!selectedBookings[booking.bookingId]?.selected}
                                                        width="100px"
                                                    />
                                                </InputGroup>
                                            </Td>
                                            <Td>
                                                <Badge colorScheme={selectedBookings[booking.bookingId]?.selected ? "green" : "red"}>
                                                    {selectedBookings[booking.bookingId]?.selected ? "Selected" : "Not Selected"}
                                                </Badge>
                                            </Td>
                                        </Tr>
                                    ))}
                                </Tbody>
                            </Table>
                        </Box>
                    </VStack>
                </ModalBody>
                <ModalFooter>
                    <Button 
                        colorScheme="blue" 
                        mr={3} 
                        onClick={handleClearPayments}
                        isLoading={isProcessing}
                        loadingText="Processing"
                        leftIcon={<CheckIcon />}
                    >
                        Clear Payments
                    </Button>
                    <Button variant="ghost" onClick={onClose} leftIcon={<CloseIcon />}>Cancel</Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};

export default ClearPaymentComponent;