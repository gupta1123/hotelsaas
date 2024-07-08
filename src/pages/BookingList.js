import React, { useState, useEffect } from 'react';
import {
    Box,
    SimpleGrid,
    Text,
    Flex,
    Badge,
    Icon,
    Input,
    Select,
    useColorModeValue,
    Button,
    useDisclosure,
    Checkbox,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
    useToast,
    VStack,
    Tooltip,
    Popover,
    PopoverTrigger,
    PopoverContent,
    PopoverArrow,
    PopoverBody
} from '@chakra-ui/react';
import { FaEdit, FaCalendarCheck, FaCalendarTimes, FaWallet, FaMoneyBillAlt, FaCheck, FaTimes, FaPlus } from 'react-icons/fa';
import moment from 'moment';
import TaskModal from '../modals/TaskModal';
import { useHistory } from 'react-router-dom';
import { Skeleton } from '@chakra-ui/react';

const calculateStatus = (bookingDetails) => {
    if (bookingDetails.cancelStatus) return "Cancelled";
    if (!bookingDetails.checkIn) return "Unknown";

    const currentMoment = moment();
    const checkinMoment = moment(bookingDetails.checkIn);
    const checkoutMoment = moment(bookingDetails.checkOut + 'T' + bookingDetails.checkOutTime);
    const twoHoursBeforeCheckout = checkoutMoment.clone().subtract(2, 'hours');
    let bookingStatus = "Unknown";

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

const BookingCard = ({ booking, groupBookings, onTaskCreate, onClick, onSave, onGroupCheckIn, onGroupCheckOut, authToken }) => {
    const bgColor = useColorModeValue('white', 'gray.700');
    const textColor = useColorModeValue('gray.800', 'white');
    const linkColor = useColorModeValue('blue.500', 'blue.200');
    const { isOpen: isCheckInOpen, onOpen: onCheckInOpen, onClose: onCheckInClose } = useDisclosure();
    const { isOpen: isCheckOutOpen, onOpen: onCheckOutOpen, onClose: onCheckOutClose } = useDisclosure();
    const { isOpen: isTaskModalOpen, onOpen: onTaskModalOpen, onClose: onTaskModalClose } = useDisclosure();
    const [taskDetails, setTaskDetails] = useState(null);
    const status = calculateStatus(booking);
    const isCheckedIn = booking.checkinStatus && !booking.checkoutStatus;
    const isCheckedOut = booking.checkinStatus && booking.checkoutStatus;
    const allCheckedIn = groupBookings && groupBookings.every(b => b.checkinStatus);
    const allCheckedOut = groupBookings && groupBookings.every(b => b.checkoutStatus);
    const noneCheckedIn = groupBookings && groupBookings.every(b => !b.checkinStatus);
    const history = useHistory();
    const toast = useToast();
    const capitalizeFirstLetter = (string) => {
        return string.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
    };

    const handleEditClick = (e) => {
        e.stopPropagation();
        if (booking && booking.bookingId) {
            const isGroupBooking = booking.groupId !== null;
            const idToUse = isGroupBooking ? booking.groupId : booking.bookingId;
            const routeToUse = isGroupBooking ? `/group-booking/${idToUse}` : `/booking/${idToUse}`;
            history.push(routeToUse);
        } else {
            console.error('Booking data is not in the expected format');
            toast({
                title: "Error",
                description: "Unable to edit this booking. Invalid data format.",
                status: "error",
                duration: 3000,
                isClosable: true
            });
        }
    };

    const handleCheckIn = async () => {
        try {
            const response = await fetch(
                `http://ec2-54-211-23-206.compute-1.amazonaws.com:8081/roomStatus/checkIn?bookingId=${booking.bookingId}`,
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
                onSave();
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

    const handleCheckOut = async () => {
        try {
            const response = await fetch(
                `http://ec2-54-211-23-206.compute-1.amazonaws.com:8081/roomStatus/checkOut?bookingId=${booking.bookingId}`,
                { method: 'PUT' }
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
                onSave();
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
                description: "An error occurred while checking out.",
                status: "error",
                duration: 3000,
                isClosable: true
            });
        }
    };

    const handleTaskCreate = () => {
        setTaskDetails({
            roomNumber: booking.roomNumber,
            bookingId: booking.bookingId,
            customerName: booking.customerName
        });
        onTaskModalOpen();
    };

    const handleGroupCheckIn = () => {
        onCheckInOpen();
    };

    const handleGroupCheckOut = () => {
        onCheckOutOpen();
    };

    return (
        <Box
            bg={bgColor}
            borderRadius="lg"
            boxShadow="md"
            p={4}
            display="flex"
            flexDirection="column"
            justifyContent="space-between"
        >
            <Flex justifyContent="space-between" alignItems="center" mb={4}>
                <Flex gap={2}>
                    <Badge colorScheme="purple">
                        {booking.groupId ? `GROUP #${booking.groupId}` : `#${booking.bookingId}`}
                    </Badge>
                    <Badge colorScheme={
                        status === "Cancelled" ? "red" :
                            status === "Due Out" ? "orange" :
                                status === "Occupied" ? "green" :
                                    status === "Due in" ? "blue" :
                                        status === "Reserved" ? "yellow" :
                                            "gray"
                    }>
                        {status}
                    </Badge>
                </Flex>
                <Icon
                    as={FaEdit}
                    color={linkColor}
                    cursor="pointer"
                    onClick={handleEditClick}
                />
            </Flex>

            <Box mb={4}>
                <Flex justifyContent="space-between" alignItems="center" mb={2}>
                    <Text fontWeight="bold" fontSize="lg" color={textColor}>{capitalizeFirstLetter(booking.customerName)}</Text>
                    {booking.groupId ? (
                        <Popover trigger="hover" placement="right">
                            <PopoverTrigger>
                                <Text color={linkColor} fontSize="sm" cursor="pointer">Room Details</Text>
                            </PopoverTrigger>
                            <PopoverContent>
                                <PopoverArrow />
                                <PopoverBody>
                                    {groupBookings && groupBookings.map(groupBooking => (
                                        <Flex key={groupBooking.bookingId} justifyContent="space-between" mb={2}>
                                            <Text>Room {groupBooking.roomNumber} - {groupBooking.roomType}</Text>
                                            <Badge colorScheme={
                                                calculateStatus(groupBooking) === "Cancelled" ? "red" :
                                                    calculateStatus(groupBooking) === "Due Out" ? "orange" :
                                                        calculateStatus(groupBooking) === "Occupied" ? "green" :
                                                            calculateStatus(groupBooking) === "Due in" ? "blue" :
                                                                calculateStatus(groupBooking) === "Reserved" ? "yellow" :
                                                                    "gray"
                                            }>
                                                {calculateStatus(groupBooking)}
                                            </Badge>
                                        </Flex>
                                    ))}
                                </PopoverBody>
                            </PopoverContent>
                        </Popover>
                    ) : (
                        <Text color={linkColor} fontSize="sm">Room {booking.roomNumber}</Text>
                    )}
                </Flex>
                <SimpleGrid columns={2} spacing={4}>
                    <Flex alignItems="center">
                        <Icon as={FaCalendarCheck} color={linkColor} mr={2} />
                        <Box>
                            <Text fontSize="xs" color="gray.500">Check-In</Text>
                            <Text fontSize="sm" color={textColor}>{moment(booking.checkIn).format('DD MMM YYYY')}</Text>
                        </Box>
                    </Flex>
                    <Flex alignItems="center">
                        <Icon as={FaCalendarTimes} color={linkColor} mr={2} />
                        <Box>
                            <Text fontSize="xs" color="gray.500">Check-Out</Text>
                            <Text fontSize="sm" color={textColor}>{moment(booking.checkOut).format('DD MMM YYYY')}</Text>
                        </Box>
                    </Flex>
                    <Flex alignItems="center">
                        <Icon as={FaWallet} color={linkColor} mr={2} />
                        <Box>
                            <Text fontSize="xs" color="gray.500">Total Amount</Text>
                            <Text fontSize="sm" color={textColor}>₹{Math.round(booking.grossTotal)}</Text>
                        </Box>
                    </Flex>
                    <Flex alignItems="center">
                        <Icon as={FaMoneyBillAlt} color={linkColor} mr={2} />
                        <Box>
                            <Text fontSize="xs" color="gray.500">Amount Due</Text>
                            <Text fontSize="sm" color={textColor}>₹{Math.round(booking.pendingAmt)}</Text>
                        </Box>
                    </Flex>
                </SimpleGrid>
            </Box>

            <Flex justifyContent="space-between">
                <Tooltip label="Check In" placement="top" hasArrow>
                    <Box>
                        <Icon
                            as={FaCheck}
                            color={(isCheckedIn || isCheckedOut || (booking.groupId && (allCheckedIn || allCheckedOut))) ? "gray.400" : linkColor}
                            cursor={(isCheckedIn || isCheckedOut || (booking.groupId && (allCheckedIn || allCheckedOut))) ? "not-allowed" : "pointer"}
                            onClick={(isCheckedIn || isCheckedOut || (booking.groupId && (allCheckedIn || allCheckedOut))) ? null : booking.groupId ? handleGroupCheckIn : handleCheckIn}
                        />
                    </Box>
                </Tooltip>
                <Tooltip label="Check Out" placement="top" hasArrow>
                    <Box>
                        <Icon
                            as={FaTimes}
                            color={(isCheckedOut || !isCheckedIn || (booking.groupId && (allCheckedOut || noneCheckedIn))) ? "gray.400" : linkColor}
                            cursor={(isCheckedOut || !isCheckedIn || (booking.groupId && (allCheckedOut || noneCheckedIn))) ? "not-allowed" : "pointer"}
                            onClick={(isCheckedOut || !isCheckedIn || (booking.groupId && (allCheckedOut || noneCheckedIn))) ? null : booking.groupId ? handleGroupCheckOut : handleCheckOut}
                        />
                    </Box>
                </Tooltip>
                <Tooltip label="Add Task" placement="top" hasArrow>
                    <Box>
                        <Icon as={FaPlus} color={linkColor} cursor="pointer" onClick={handleTaskCreate} />
                    </Box>
                </Tooltip>
            </Flex>

            {/* Group Check-In Modal */}
            <Modal isOpen={isCheckInOpen} onClose={onCheckInClose}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Group Check-In</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        {groupBookings && groupBookings.map(groupBooking => (
                            <Flex key={groupBooking.bookingId} alignItems="center" mb={2}>
                                <Checkbox isDisabled={groupBooking.checkinStatus} defaultIsChecked={groupBooking.checkinStatus}>
                                    Room {groupBooking.roomNumber} - {calculateStatus(groupBooking)}
                                </Checkbox>
                            </Flex>
                        ))}
                    </ModalBody>
                    <ModalFooter>
                        <Button colorScheme="blue" mr={3} onClick={() => onGroupCheckIn(groupBookings)}>Check-In</Button>
                        <Button variant="ghost" onClick={onCheckInClose}>Cancel</Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            {/* Group Check-Out Modal */}
            <Modal isOpen={isCheckOutOpen} onClose={onCheckOutClose}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Group Check-Out</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        {groupBookings && groupBookings.map(groupBooking => (
                            <Flex key={groupBooking.bookingId} alignItems="center" mb={2}>
                                <Checkbox isDisabled={!groupBooking.checkinStatus || groupBooking.checkoutStatus} defaultIsChecked={groupBooking.checkoutStatus}>
                                    Room {groupBooking.roomNumber} - {calculateStatus(groupBooking)}
                                </Checkbox>
                            </Flex>
                        ))}
                    </ModalBody>
                    <ModalFooter>
                        <Button colorScheme="blue" mr={3} onClick={() => onGroupCheckOut(groupBookings)}>Check-Out</Button>
                        <Button variant="ghost" onClick={onCheckOutClose}>Cancel</Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </Box>
    );
};

const FilterCard = ({ filters, onFilterChange, roomNumbers }) => {
    const bgColor = useColorModeValue('white', 'gray.700');

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === 'startDate') {
            const newEndDate = moment(value).add(1, 'days').format('YYYY-MM-DD');
            onFilterChange(name, value);
            onFilterChange('endDate', newEndDate);
        } else {
            onFilterChange(name, value);
        }
    };

    return (
        <Box bg={bgColor} p={4} borderRadius="lg" boxShadow="md" mb={6}>
            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                <Input
                    placeholder="Search by name"
                    name="name"
                    value={filters.name}
                    onChange={handleChange}
                />
                <Select
                    placeholder="Room Number"
                    name="roomNumber"
                    value={filters.roomNumber}
                    onChange={handleChange}
                >
                    <option value="">All Rooms</option>
                    {roomNumbers.map((room) => (
                        <option key={room} value={room}>{room}</option>
                    ))}
                </Select>
                <Select
                    placeholder="Status"
                    name="status"
                    value={filters.status}
                    onChange={handleChange}
                >
                    <option value="">All Statuses</option>
                    <option value="Cancelled">Cancelled</option>
                    <option value="Due in">Due in</option>
                    <option value="Occupied">Occupied</option>
                    <option value="Due Out">Due Out</option>
                    <option value="Reserved">Reserved</option>
                    <option value="Checked out">Checked out</option>
                </Select>
                <Input
                    type="date"
                    name="startDate"
                    value={filters.startDate}
                    onChange={handleChange}
                />
                <Input
                    type="date"
                    name="endDate"
                    value={filters.endDate}
                    onChange={handleChange}
                />
            </SimpleGrid>
        </Box>
    );
};

const BookingList = ({ authToken }) => {
    const history = useHistory();
    const toast = useToast();
    const [bookings, setBookings] = useState([]);
    const [filteredBookings, setFilteredBookings] = useState([]);
    const [roomNumbers, setRoomNumbers] = useState([]);
    const [filters, setFilters] = useState({
        name: '',
        roomNumber: '',
        status: '',
        startDate: moment().subtract(3, 'days').format('YYYY-MM-DD'),
        endDate: moment().add(3, 'days').format('YYYY-MM-DD')
    });
    const [isLoading, setIsLoading] = useState(true);
    const [selectedRooms, setSelectedRooms] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(9);
    const { isOpen: isTaskModalOpen, onOpen: onTaskModalOpen, onClose: onTaskModalClose } = useDisclosure();
    const [taskDetails, setTaskDetails] = useState(null);
    const mainBgColor = useColorModeValue("gray.50", "gray.900");

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredBookings.slice(indexOfFirstItem, indexOfLastItem);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    const prepareBookingsData = (bookingsData) => {
        const groupedBookings = {};
        const finalBookings = [];

        bookingsData.forEach(booking => {
            if (booking.groupId) {
                if (!groupedBookings[booking.groupId]) {
                    groupedBookings[booking.groupId] = {
                        ...booking,
                        isGroupBooking: true,
                        rooms: []
                    };
                }
                groupedBookings[booking.groupId].rooms.push(booking);
            } else {
                finalBookings.push(booking);
            }
        });

        // Add group bookings to final array
        Object.values(groupedBookings).forEach(groupBooking => {
            finalBookings.push(groupBooking);
        });

        return finalBookings;
    };

    const handleCheckoutConfirm = async (booking) => {
        const isGroupBooking = booking.groupId != null;
        const url = isGroupBooking
            ? `http://ec2-54-211-23-206.compute-1.amazonaws.com:8081/roomStatus/checkOutForGroup?groupId=${booking.groupId}`
            : `http://ec2-54-211-23-206.compute-1.amazonaws.com:8081/roomStatus/checkOut?bookingId=${booking.bookingId}`;
        const payload = isGroupBooking ? { bookingList: selectedRooms } : null;

        try {
            const response = await fetch(url, {
                method: 'PUT',
                headers: {
                    Authorization: `Bearer ${authToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) throw new Error('Checkout failed');
            toast({
                title: 'Success',
                description: 'Checkout successful',
                status: 'success',
                duration: 3000,
                isClosable: true,
            });

            // Navigate to Settlement page
            history.push({
                pathname: '/settlement',
                state: {
                    customerId: isGroupBooking ? null : booking.bookingId,
                    groupId: isGroupBooking ? booking.groupId : null,
                    authToken: authToken
                }
            });

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

    const SkeletonCard = () => (
        <Box
            width="100%"
            borderRadius="lg"
            overflow="hidden"
            boxShadow="md"
            p={4}
        >
            <Skeleton height="20px" mb={2} />
            <Skeleton height="40px" mb={4} />
            <Skeleton height="20px" width="80%" mb={2} />
            <Skeleton height="20px" width="60%" mb={2} />
            <Skeleton height="20px" width="40%" />
        </Box>
    );

    useEffect(() => {
        fetchBookings();
    }, [authToken, filters.startDate, filters.endDate]);

    useEffect(() => {
        if (bookings.length > 0) {
            const filtered = bookings.filter(booking => {
                const nameMatch = booking.customerName.toLowerCase().includes(filters.name.toLowerCase());
                const roomNumberMatch = !filters.roomNumber || booking.roomNumber.toString() === filters.roomNumber;
                const statusMatch = !filters.status || calculateStatus(booking) === filters.status;
                return nameMatch && roomNumberMatch && statusMatch;
            });
            setFilteredBookings(filtered);
        } else {
            setFilteredBookings([]);
        }
    }, [bookings, filters]);

    const fetchBookings = async () => {
        setIsLoading(true);
        try {
            const { startDate, endDate } = filters;
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
            if (Array.isArray(data)) {
                const preparedData = prepareBookingsData(data);
                const sortedData = preparedData.sort((a, b) => moment(b.checkIn).valueOf() - moment(a.checkIn).valueOf());
                setBookings(sortedData);

                // Extract unique room numbers
                const uniqueRoomNumbers = [...new Set(data.map(booking => booking.roomNumber))].sort((a, b) => a - b);
                setRoomNumbers(uniqueRoomNumbers);
            } else {
                console.error('Received data is not an array:', data);
                setBookings([]);
                setRoomNumbers([]);
            }
        } catch (error) {
            console.error('Error fetching bookings:', error);
            setBookings([]);
            setRoomNumbers([]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleFilterChange = (name, value) => {
        setFilters(prev => {
            const newFilters = { ...prev, [name]: value };
            if (name === 'startDate' && !newFilters.endDate) {
                newFilters.endDate = moment(newFilters.startDate).add(1, 'days').format('YYYY-MM-DD');
            }
            return newFilters;
        });
    };

    const groupedBookings = {};
    bookings.forEach(booking => {
        if (booking.groupId) {
            if (!groupedBookings[booking.groupId]) {
                groupedBookings[booking.groupId] = [];
            }
            groupedBookings[booking.groupId].push(booking);
        }
    });

    const handleTaskCreate = (taskDetails) => {
        setTaskDetails(taskDetails);
        onTaskModalOpen();
    };

    const handleGroupCheckIn = async (groupBookings) => {
        const selectedBookings = groupBookings.filter(groupBooking => groupBooking.checked);
        try {
            for (const booking of selectedBookings) {
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
            fetchBookings();
        } catch (error) {
            console.error('Error checking in group bookings:', error);
        }
    };

    const handleGroupCheckOut = async (groupBookings) => {
        const selectedBookings = groupBookings.filter(groupBooking => groupBooking.checked);
        try {
            for (const booking of selectedBookings) {
                await fetch(
                    `http://ec2-54-211-23-206.compute-1.amazonaws.com:8081/roomStatus/checkOut?bookingId=${booking.bookingId}`,
                    { method: 'PUT' }
                );
            }
            fetchBookings();
        } catch (error) {
            console.error('Error checking out group bookings:', error);
        }
    };

    return (
        <Box p={5} bg={mainBgColor}>
            <VStack spacing={4} align="stretch">
                <FilterCard filters={filters} onFilterChange={handleFilterChange} roomNumbers={roomNumbers} />

                <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                    {isLoading
                        ? Array(9).fill(0).map((_, index) => <SkeletonCard key={index} />)
                        : currentItems.map((booking) => (
                            <BookingCard
                                key={booking.groupId || booking.bookingId}
                                booking={booking}
                                groupBookings={booking.isGroupBooking ? booking.rooms : null}
                                onTaskCreate={handleTaskCreate}
                                onSave={fetchBookings}
                                authToken={authToken}
                                onGroupCheckIn={handleGroupCheckIn}
                                onGroupCheckOut={handleGroupCheckOut}
                            />
                        ))
                    }
                </SimpleGrid>
                <Flex justifyContent="center" mt={4}>
                    {[...Array(Math.ceil(filteredBookings.length / itemsPerPage)).keys()].map((number) => (
                        <Button
                            key={number + 1}
                            onClick={() => paginate(number + 1)}
                            colorScheme={currentPage === number + 1 ? "blue" : "gray"}
                            mx={1}
                        >
                            {number + 1}
                        </Button>
                    ))}
                </Flex>
            </VStack>

            <TaskModal
                isOpen={isTaskModalOpen}
                onClose={onTaskModalClose}
                task={taskDetails}
                onSave={() => {
                    fetchBookings();
                    onTaskModalClose();
                }}
            />
        </Box>
    );
};

export default BookingList;