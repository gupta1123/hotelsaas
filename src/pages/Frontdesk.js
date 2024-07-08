import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
    Box,
    SimpleGrid,
    Text,
    Flex,
    HStack,
    Icon,
    Button,
    useColorModeValue,
    VStack,
    Select,
    Menu,
    MenuButton,
    MenuList,
    MenuItem,
    useDisclosure,
    Input,
} from '@chakra-ui/react';
import { FaBed, FaToilet, FaMountain, FaParking, FaSprayCan, FaConciergeBell, FaEllipsisV } from 'react-icons/fa';
import { Spin } from "antd";
import { useHistory } from "react-router-dom";
import DueInNotification from '../components/DueInNotification';
import moment from "moment";
import TimeSelectionModal from '../components/TimeSelectionModal';
import TaskModal from '../modals/TaskModal';
import { Skeleton, SkeletonText } from '@chakra-ui/react';

const statusColors = {
    vacant: { light: "#fdddb3", dark: "#fdddb3" },
    occupied: { light: "#92deba", dark: "#92deba" },
    reserved: { light: "#f9a63a", dark: "#f9a63a" },
    outoforder: { light: "#5d6679", dark: "#5d6679" },
    dueout: { light: "#b6d3fa", dark: "#b6d3fa" },
    dirty: { light: "#aa3028", dark: "#aa3028" },
};

const filterColors = {
    All: { light: "#E2E8F0", dark: "#4A5568" },
    Occupied: { light: "#92deba", dark: "#92deba" },
    Vacant: { light: "#fdddb3", dark: "#fdddb3" },
    Reserved: { light: "#f9a63a", dark: "#f9a63a" },
    "Out of Order": { light: "#5d6679", dark: "#5d6679" },
    "Due Out": { light: "#b6d3fa", dark: "#b6d3fa" },
    Dirty: { light: "#aa3028", dark: "#aa3028" },
};
const iconMapping = {
    Queen: FaBed,
    Twin: FaBed,
    Single: FaBed,
    Double: FaBed,
    Balcony: FaMountain,
    Mountain: FaMountain,
    Parking: FaParking,
    City: FaMountain,
    Western: FaToilet,
    Indian: FaToilet,
};

const SkeletonCard = () => (
    <Box
        width="100%"
        borderRadius="5px"
        overflow="hidden"
        boxShadow="0 4px 8px 0 rgba(0, 0, 0, 0.2)"
        borderWidth="1px"
    >
        <Skeleton height="20px" />
        <Box p="10px">
            <Skeleton height="24px" width="80%" mb={2} />
            <SkeletonText mt="2" noOfLines={2} spacing="2" />
        </Box>
        <Box p="10px">
            <Skeleton height="20px" width="60%" />
        </Box>
    </Box>
);

const RoomCard = ({ room, onClick, onTaskCreate, authToken }) => {
    const { isOpen: isTaskModalOpen, onOpen: onTaskModalOpen, onClose: onTaskModalClose } = useDisclosure();
    const [taskDetails, setTaskDetails] = useState(null);

    const handleOpenTaskModal = (e) => {
        e.stopPropagation();
        setTaskDetails({
            roomNumber: room.first.room,
            bookingId: room.first.bookingId,
            customerName: room.first.customerName
        });
        onTaskModalOpen();
    };

    const handleRightClick = (e) => {
        e.preventDefault();
        handleOpenTaskModal(e);
    };

    const formatName = (name) => {
        if (!name) return "";
        return name.trim();
      };
    const capitalizeFirstLetter = (string) => {
        return string.charAt(0).toUpperCase() + string.slice(1);
    };

    const bgMode = useColorModeValue("light", "dark");
    const borderColor = useColorModeValue("gray.200", "gray.600");
    const statusColor = statusColors[room.first.status.toLowerCase()]?.[bgMode] || statusColors.dueout[bgMode];
    const cardBg = useColorModeValue("white", "gray.700");
    const textColor = useColorModeValue("gray.800", "white");
    const datePickerColor = useColorModeValue("black", "white");

    const cleaningTask = room.second?.tasks.find((task) => task.taskName === "Cleaning");
    const roomServiceTask = room.second?.tasks.find((task) => task.taskName === "Room Service");





    return (
        <Box
            width="100%"
            borderRadius="5px"
            overflow="hidden"
            boxShadow="0 4px 8px 0 rgba(0, 0, 0, 0.2)"
            onClick={() => onClick(room)}
            onContextMenu={handleRightClick}
            cursor="pointer"
            fontFamily="Poppins, sans-serif"
            borderColor={borderColor}
            borderWidth="1px"
        >
            <Box h="20px" bg={statusColor} />
            <Box bg={cardBg} p="10px">
                <Flex justifyContent="space-between" alignItems="center">
                    <Text fontWeight="bold" fontSize="lg" color={textColor}>
                        Room {room.first.room}
                    </Text>
                    <Text fontSize="sm" color={textColor}>
                        {room.first.roomType}
                    </Text>
                </Flex>
            </Box>
            <Box bg={cardBg} p="10px" textAlign="center">
                <Text fontWeight="medium" minHeight="18px" color={textColor}>
                    {formatName(room.first.customerName)}
                </Text>
            </Box>
            <Box bg={cardBg} p="10px">
                <Flex justifyContent="space-between" alignItems="center">
                    <HStack spacing={2}>
                        <Icon as={iconMapping[room.first.bedType]} color={textColor} />
                        <Icon as={iconMapping[room.first.viewType]} color={textColor} />
                        <Icon as={iconMapping[room.first.bathroomType]} color={textColor} />
                    </HStack>
                    <HStack spacing={2}>
                        {cleaningTask && (
                            <Icon as={FaSprayCan} color="red.500" />
                        )}
                        {roomServiceTask && (
                            <Icon as={FaConciergeBell} color="red.500" />
                        )}
                    </HStack>
                </Flex>
            </Box>
            <Menu>
                <MenuButton as={Button} size="sm" rightIcon={<FaEllipsisV />} position="absolute" top={1} right={1}>
                    Actions
                </MenuButton>
                <MenuList>
                    <MenuItem onClick={handleOpenTaskModal}>Add Task</MenuItem>
                    {room.second?.tasks.map((task) => (
                        <MenuItem key={task.taskId} onClick={(e) => { e.stopPropagation(); handleOpenTaskModal(task); }}>
                            Edit {task.taskName.charAt(0).toUpperCase() + task.taskName.slice(1).toLowerCase()}
                        </MenuItem>
                    ))}
                </MenuList>
            </Menu>
            <TaskModal
                isOpen={isTaskModalOpen}
                onClose={onTaskModalClose}
                task={taskDetails}
                onSave={() => {
                    onTaskCreate();
                    onTaskModalClose();
                }}
                authToken={authToken}
            />
        </Box>
    );
};

const Frontdesk = ({ authToken }) => {
    const [roomsData, setRoomsData] = useState([]);
    const [currentFilter, setCurrentFilter] = useState("All");
    const [dropdownValue, setDropdownValue] = useState("");
    //const [selectedDate, setSelectedDate] = useState(null);
    const [selectedDate, setSelectedDate] = useState(moment().format('YYYY-MM-DD'));

    const [isLoading, setIsLoading] = useState(false);
    const [showTimeSelectionModal, setShowTimeSelectionModal] = useState(false);
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [checkInDate, setCheckInDate] = useState(null);
    const [checkOutDate, setCheckOutDate] = useState(null);
    const { isOpen: isTaskModalOpen, onOpen: onTaskModalOpen, onClose: onTaskModalClose } = useDisclosure();
    const [taskDetails, setTaskDetails] = useState(null);
    const history = useHistory();

    const updateBookingStatus = (item) => {
        const currentMoment = moment();
        const checkinMoment = moment(`${item.first.checkIn}T${item.first.checkInTime}`);
        const checkoutMoment = moment(`${item.first.checkOut}T${item.first.checkOutTime}`);
        const twoHoursBeforeCheckout = checkoutMoment.clone().subtract(2, 'hours');

        if (item.first.status.toLowerCase() === 'outoforder') {
            // Do nothing for "out of order" status
        } else if (item.first.checkinStatus && !item.first.checkoutStatus && currentMoment.isBetween(twoHoursBeforeCheckout, checkoutMoment, null, '[]')) {
            item.first.status = "dueout";
        } else if (item.first.checkinStatus && !item.first.checkoutStatus) {
            if (currentMoment.isAfter(checkoutMoment)) {
                item.first.status = "dueout";
            } else {
                item.first.status = "occupied";
            }
        } else if (item.first.roomAvailabilityStatus === "reserved" && currentMoment.isBefore(checkinMoment)) {
            item.first.status = "reserved";
        } else if (item.first.status.toLowerCase() === "dirty") {
            item.first.customerName = "";
        } else if (item.first.status.toLowerCase() === "vacant") {
            if (item.second && item.second.tasks.some(task => task.taskName === "Cleaning" && task.status === "Assigned")) {
                item.first.status = "dirty";
            } else {
                item.first.customerName = "";
            }
        }

        return item;
    };

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            let url = "http://ec2-54-211-23-206.compute-1.amazonaws.com:8081/roomStatus/currentStatus";
            if (selectedDate) {
                url += `?date=${selectedDate}`;
            }
            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${authToken}`
                }
            });
            let data = await response.json();
            data = data.map(updateBookingStatus);
            setRoomsData(data);
        } catch (error) {
            console.error("Error fetching data: ", error);
        } finally {
            setIsLoading(false);
        }
    }, [authToken, selectedDate]);

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 30000);
        return () => clearInterval(interval);
    }, [fetchData]);

    const handleTaskCreate = (taskDetails) => {
        setTaskDetails(taskDetails);
        onTaskModalOpen();
    };

    const handleDateChange = async (date) => {
        if (!date) return; // Return early if no date is provided

        const dateString = moment(date).format('YYYY-MM-DD');
        setSelectedDate(dateString);
        setIsLoading(true);
        try {
            const nextDay = moment(dateString).add(1, 'days').format('YYYY-MM-DD');
            const response = await fetch(
                `http://ec2-54-211-23-206.compute-1.amazonaws.com:8081/roomStatus/currentStatus?date=${dateString}&endDate=${nextDay}`,
                {
                    headers: {
                        'Authorization': `Bearer ${authToken}`
                    }
                }
            );
            let data = await response.json();
            data = data.map(item => updateBookingStatus({ ...item, first: { ...item.first, checkIn: dateString, checkOut: nextDay } }));
            setRoomsData(data);
        } catch (error) {
            console.error("Error fetching data: ", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCardClick = (roomData) => {
        const room = roomData.first;
        const status = room.status.toLowerCase();
        const groupId = room.groupId;
        const bookingId = room.bookingId;

        if (status === 'outoforder') {
            return;
        }

        if (status === 'vacant' || status === 'dirty') {
            setSelectedRoom(room);
            setShowTimeSelectionModal(true);
        } else if (status === 'dueout' || status === 'reserved' || status === 'occupied') {
            if (groupId) {
                history.push(`/group-booking/${groupId}`);
            } else {
                history.push(`/booking/${bookingId}`);
            }
        }
    };

    const handleTimeSelected = (selectedTime, selectedCheckOutDate) => {
        console.log('Selected Check-out Date:', selectedCheckOutDate);
        const checkOutDate = selectedCheckOutDate || moment(selectedDate || moment()).add(1, 'days').format('YYYY-MM-DD');

        history.push({
            pathname: '/bookingDetails',
            state: {
                selectedRooms: [{
                    room: selectedRoom.room,
                    roomType: selectedRoom.roomType,
                    adults: 1,
                    children: 0,
                }],
                checkInDate: selectedDate || moment().format('YYYY-MM-DD'),
                checkOutDate: checkOutDate,
                checkInTime: selectedTime, // Use the selected time string directly
                checkOutTime: selectedTime, // Set check-out time the same as check-in time
            },
        });
    };



    const getFilteredRooms = () => {
        let filteredRooms = roomsData.filter(item => {
            const status = item.first.status.toLowerCase();
            if (currentFilter === "All") return true;
            if (currentFilter === "Out of Order") return status === "outoforder";
            if (currentFilter === "Due Out") return status === "dueout";
            return status === currentFilter.toLowerCase();
        });

        if (dropdownValue) {
            filteredRooms = filteredRooms.filter(item => item.first.floor === dropdownValue);
        }
        return filteredRooms;
    };

    const filteredRooms = getFilteredRooms();

    const bgMode = useColorModeValue("light", "dark");
    const buttonTextColor = useColorModeValue("gray.800", "white");
    const mainBgColor = useColorModeValue("gray.50", "gray.900");
    const selectBgColor = useColorModeValue("white", "gray.700");
    const datePickerBgColor = useColorModeValue("white", "#2D3748");
    const datePickerColor = useColorModeValue("black", "white");

    const filterButtons = useMemo(() => {
        return ["All", "Occupied", "Vacant", "Reserved", "Out of Order", "Due Out", "Dirty"].map((filter) => (
            <Button
                key={filter}
                onClick={() => setCurrentFilter(filter)}
                bg={filterColors[filter][bgMode]}
                color={buttonTextColor}
                _hover={{ opacity: 0.8 }}
                size="sm"
                mb={2}
                mr={2}
                flexGrow={0}
                flexShrink={0}
            >
                {filter} ({roomsData.filter(item => {
                    const status = item.first.status.toLowerCase();
                    if (filter === "All") return true;
                    if (filter === "Out of Order") return status === "outoforder";
                    if (filter === "Due Out") return status === "dueout";
                    return status === filter.toLowerCase();
                }).length})
            </Button>
        ));
    }, [currentFilter, bgMode, buttonTextColor, roomsData]);

    return (
        <Box p={5} bg={mainBgColor} fontFamily="Poppins, sans-serif">
            <VStack spacing={4} align="stretch">
                <Flex direction={{ base: "column", md: "row" }} justifyContent="space-between" alignItems="flex-start">
                    <Flex flexWrap="wrap" justifyContent="flex-start" mb={{ base: 4, md: 0 }} width={{ base: "100%", md: "auto" }}>
                        {filterButtons}
                    </Flex>
                    <HStack spacing={2} flexWrap="wrap" justifyContent={{ base: "flex-start", md: "flex-end" }} width={{ base: "100%", md: "auto" }}>
                        <Select
                            value={dropdownValue}
                            onChange={(e) => setDropdownValue(e.target.value)}
                            placeholder="All Floors"
                            size="sm"
                            bg={selectBgColor}
                        >
                            <option value="1">First Floor</option>
                            <option value="2">Second Floor</option>
                        </Select>

                        <Input
                            type="date"
                            value={selectedDate}
                            onChange={(e) => handleDateChange(e.target.value)}
                            bg={datePickerBgColor}
                            color={datePickerColor}
                            size="sm"
                        />
                        {isLoading && <Spin size="small" />}
                    </HStack>
                </Flex>

                <DueInNotification roomsData={roomsData} />

                <SimpleGrid columns={{ base: 1, sm: 2, lg: 3, xl: 4 }} spacing={6}>
                    {isLoading ? (
                        Array(12).fill(0).map((_, index) => (
                            <SkeletonCard key={index} />
                        ))
                    ) : (
                        filteredRooms.map((room, index) => (
                            <RoomCard
                                key={index}
                                room={room}
                                onClick={handleCardClick}
                                onTaskCreate={handleTaskCreate}
                                authToken={authToken}
                            />
                        ))
                    )}
                </SimpleGrid>
            </VStack>

            {showTimeSelectionModal && (
                <TimeSelectionModal
                    isOpen={showTimeSelectionModal}
                    onClose={() => setShowTimeSelectionModal(false)}
                    onTimeSelected={handleTimeSelected}
                />
            )}

            <TaskModal
                isOpen={isTaskModalOpen}
                onClose={onTaskModalClose}
                task={taskDetails}
                onSave={() => {
                    fetchData();
                    onTaskModalClose();
                }}
                authToken={authToken}
            />
        </Box>
    );
};

export default Frontdesk;