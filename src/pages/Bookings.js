import React, { useState, useEffect } from 'react';
import {
    Box, VStack, HStack, Text, Heading, Button, Icon, Flex, Spacer,
    useColorModeValue, SimpleGrid, Input, Select, NumberInput, NumberInputField,
    NumberInputStepper, NumberIncrementStepper, NumberDecrementStepper, Tag,
    Checkbox, Grid, useToast, Drawer, DrawerBody, DrawerHeader, DrawerOverlay,
    DrawerContent, DrawerCloseButton, InputGroup, InputLeftElement
} from '@chakra-ui/react';
import { FaBed, FaCalendarAlt, FaClock, FaUsers, FaChild, FaSwimmingPool, FaMountain, FaToilet, FaShoppingCart, FaCouch, FaEye, FaShower, FaBath, FaUndo } from 'react-icons/fa';
import { useHistory } from 'react-router-dom';
import axios from 'axios';
import moment from 'moment';

const Bookings = ({ authToken }) => {
    const [checkIn, setCheckIn] = useState(moment().format("YYYY-MM-DD"));
    const [checkOut, setCheckOut] = useState(moment().add(1, 'days').format("YYYY-MM-DD"));
    const [checkInTime, setCheckInTime] = useState(moment().format("HH:mm"));
    const [checkOutTime, setCheckOutTime] = useState('11:00');
    const [adults, setAdults] = useState(1);
    const [children, setChildren] = useState(0);
    const [roomTypeFilter, setRoomTypeFilter] = useState("All");
    const [viewFilter, setViewFilter] = useState("All");
    const [bathroomFilter, setBathroomFilter] = useState("All");
    const [bedTypeFilter, setBedTypeFilter] = useState("All");
    const [apiData, setApiData] = useState([]);
    const [filteredRooms, setFilteredRooms] = useState([]);
    const [selectedRooms, setSelectedRooms] = useState([]);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    const history = useHistory();
    const toast = useToast();

    const bgColor = useColorModeValue('white', 'gray.700');
    const textColor = useColorModeValue('gray.800', 'white');
    const borderColor = useColorModeValue('gray.200', 'gray.600');

    useEffect(() => {
        const nextDay = moment(checkIn).add(1, 'days').format("YYYY-MM-DD");
        setCheckOut(nextDay);
        setCheckOutTime(checkInTime);
    }, [checkIn, checkInTime]);

    useEffect(() => {
        fetchVacantRooms();
    }, [checkIn, checkOut, checkInTime, checkOutTime, authToken]);

    useEffect(() => {
        filterRooms();
    }, [roomTypeFilter, viewFilter, bathroomFilter, bedTypeFilter, apiData]);


    const fetchVacantRooms = async () => {
        const formattedCheckInDate = moment(checkIn).format("YYYY-MM-DD");
        const formattedCheckOutDate = moment(checkOut).format("YYYY-MM-DD");
        const url = `http://ec2-54-211-23-206.compute-1.amazonaws.com:8081/roomStatus/getVacantBetween?checkInDate=${formattedCheckInDate}&checkInTime=${checkInTime}&checkOutDate=${formattedCheckOutDate}&checkOutTime=${checkOutTime}`;

        try {
            const response = await axios.get(url, {
                headers: { 'Authorization': `Bearer ${authToken}` }
            });
            setApiData(response.data);
        } catch (error) {
            console.error("Error fetching data: ", error);
        }
    };

    const filterRooms = () => {
        let filtered = [...apiData];

        if (roomTypeFilter !== "All") {
            filtered = filtered.filter(room => room.roomType === roomTypeFilter);
        }
        if (viewFilter !== "All") {
            filtered = filtered.filter(room => room.viewType === viewFilter);
        }
        if (bathroomFilter !== "All") {
            filtered = filtered.filter(room => room.bathroomType === bathroomFilter);
        }
        if (bedTypeFilter !== "All") {
            filtered = filtered.filter(room => room.bedType === bedTypeFilter);
        }

        setFilteredRooms(filtered);
    };

    const toggleRoomSelection = (room) => {
        setSelectedRooms(prevSelected =>
            prevSelected.some(r => r.room === room.room)
                ? prevSelected.filter(r => r.room !== room.room)
                : [...prevSelected, room]
        );
    };

    const handleProceed = () => {
        if (selectedRooms.length === 0) {
            toast({
                title: "No rooms selected",
                description: "Please select at least one room to proceed.",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
            return;
        }

        history.push({
            pathname: "/bookingDetails",
            state: {
                selectedRooms,
                checkInDate: checkIn,
                checkOutDate: checkOut,
                checkInTime,
                checkOutTime,
                adults,
                children,
            },
        });
    };

    const resetFilters = () => {
        setRoomTypeFilter("All");
        setViewFilter("All");
        setBathroomFilter("All");
        setBedTypeFilter("All");
    };


    const RoomCard = ({ room }) => (
        <Box
            borderWidth="1px"
            borderRadius="lg"
            overflow="hidden"
            bg={bgColor}
            boxShadow="md"
            p={4}
            transition="all 0.3s"
            _hover={{ transform: 'translateY(-5px)', boxShadow: 'xl' }}
        >
            <Flex alignItems="center" mb={3}>
                <Icon as={FaBed} mr={2} color="blue.500" />
                <Heading size="md" color={textColor}>{room.room}</Heading>
                <Spacer />
                <Checkbox
                    isChecked={selectedRooms.some(r => r.room === room.room)}
                    onChange={() => toggleRoomSelection(room)}
                    colorScheme="blue"
                    size="lg"
                />
            </Flex>
            <Text color={textColor} mb={3} fontWeight="bold">{room.roomType}</Text>
            <HStack spacing={2} mb={3} flexWrap="wrap">
                <Tag colorScheme="blue" variant="outline">
                    <Icon as={FaEye} mr={1} />
                    {room.viewType}
                </Tag>
                <Tag colorScheme="green" variant="outline">
                    <Icon as={FaCouch} mr={1} />
                    {room.bedType}
                </Tag>
                <Tag colorScheme="purple" variant="outline">
                    <Icon as={FaBath} mr={1} />
                    {room.bathroomType}
                </Tag>
            </HStack>
            <Flex alignItems="center" justifyContent="space-between">
                <Text color={textColor} fontWeight="bold">₹{room.costPerDay.toFixed(2)}</Text>
                <Text color="gray.500" fontSize="sm">per night</Text>
            </Flex>
        </Box>
    );

    return (
        <Box p={5} position="relative" minHeight="100vh">
            <VStack spacing={6} align="stretch">
                <Heading size="xl" mb={4}>Create Booking</Heading>

                <Box bg={bgColor} p={6} borderRadius="md" boxShadow="lg">
                    <Grid templateColumns={{ base: "1fr", md: "1fr 1px 1fr" }} gap={6}>
                        <VStack spacing={4} align="stretch">
                            <Heading size="md" mb={2}>Dates and Times</Heading>
                            <HStack>
                                <Box flex={1}>
                                    <Text mb={2}>Check-in</Text>
                                    <InputGroup>
                                        <InputLeftElement pointerEvents="none">
                                            <Icon as={FaCalendarAlt} color="blue.500" />
                                        </InputLeftElement>
                                        <Input
                                            type="date"
                                            value={checkIn}
                                            onChange={(e) => setCheckIn(e.target.value)}
                                            min={moment().format("YYYY-MM-DD")}
                                            pl="2.5rem"
                                        />
                                    </InputGroup>
                                </Box>
                                <Box flex={1}>
                                    <Text mb={2}>Time</Text>
                                    <InputGroup>
                                        <InputLeftElement pointerEvents="none">
                                            <Icon as={FaClock} color="blue.500" />
                                        </InputLeftElement>
                                        <Input
                                            type="time"
                                            value={checkInTime}
                                            onChange={(e) => setCheckInTime(e.target.value)}
                                            pl="2.5rem"
                                        />
                                    </InputGroup>
                                </Box>
                            </HStack>
                            <HStack>
                                <Box flex={1}>
                                    <Text mb={2}>Check-out</Text>
                                    <InputGroup>
                                        <InputLeftElement pointerEvents="none">
                                            <Icon as={FaCalendarAlt} color="blue.500" />
                                        </InputLeftElement>
                                        <Input
                                            type="date"
                                            value={checkOut}
                                            onChange={(e) => setCheckOut(e.target.value)}
                                            min={moment(checkIn).add(1, 'days').format("YYYY-MM-DD")}
                                            pl="2.5rem"
                                        />
                                    </InputGroup>
                                </Box>
                                <Box flex={1}>
                                    <Text mb={2}>Time</Text>
                                    <InputGroup>
                                        <InputLeftElement pointerEvents="none">
                                            <Icon as={FaClock} color="blue.500" />
                                        </InputLeftElement>
                                        <Input
                                            type="time"
                                            value={checkOutTime}
                                            isReadOnly
                                            pl="2.5rem"
                                        />
                                    </InputGroup>
                                </Box>
                            </HStack>
                        </VStack>

                        <Box borderLeft="1px solid" borderColor={borderColor} />

                        <VStack spacing={4} align="stretch">
                            <Heading size="md" mb={2}>Guests</Heading>
                            <HStack>
                                <Box flex={1}>
                                    <Text mb={2}>Adults</Text>
                                    <InputGroup>
                                        <InputLeftElement pointerEvents="none">
                                            <Icon as={FaUsers} color="blue.500" />
                                        </InputLeftElement>
                                        <NumberInput min={1} max={3} value={adults} onChange={(value) => setAdults(parseInt(value))}>
                                            <NumberInputField pl="2.5rem" />
                                            <NumberInputStepper>
                                                <NumberIncrementStepper />
                                                <NumberDecrementStepper />
                                            </NumberInputStepper>
                                        </NumberInput>
                                    </InputGroup>
                                </Box>
                                <Box flex={1}>
                                    <Text mb={2}>Children</Text>
                                    <InputGroup>
                                        <InputLeftElement pointerEvents="none">
                                            <Icon as={FaChild} color="blue.500" />
                                        </InputLeftElement>
                                        <NumberInput min={0} value={children} onChange={(value) => setChildren(parseInt(value))}>
                                            <NumberInputField pl="2.5rem" />
                                            <NumberInputStepper>
                                                <NumberIncrementStepper />
                                                <NumberDecrementStepper />
                                            </NumberInputStepper>
                                        </NumberInput>
                                    </InputGroup>
                                </Box>
                            </HStack>
                        </VStack>
                    </Grid>
                </Box>

                <Box bg={bgColor} p={6} borderRadius="md" boxShadow="lg">
                    <Flex justifyContent="space-between" alignItems="center" mb={4}>
                        <Heading size="md">Filters</Heading>
                        <Button
                            leftIcon={<FaUndo />}
                            colorScheme="blue"
                            variant="outline"
                            size="sm"
                            onClick={resetFilters}
                        >
                            Reset Filters
                        </Button>
                    </Flex>
                    <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={4}>
                        <Select value={roomTypeFilter} onChange={(e) => setRoomTypeFilter(e.target.value)} icon={<FaBed color="blue" />}>
                            <option value="All">All Room Types</option>
                            <option value="AC">AC</option>
                            <option value="Non AC">Non AC</option>
                            <option value="Deluxe">Deluxe</option>
                        </Select>
                        <Select value={viewFilter} onChange={(e) => setViewFilter(e.target.value)} icon={<FaMountain color="blue" />}>
                            <option value="All">All Views</option>
                            <option value="City">City</option>
                            <option value="Parking">Parking</option>
                            <option value="Balcony">Balcony</option>
                        </Select>
                        <Select value={bathroomFilter} onChange={(e) => setBathroomFilter(e.target.value)} icon={<FaToilet color="blue" />}>
                            <option value="All">All Bathrooms</option>
                            <option value="Indian">Indian</option>
                            <option value="Western">Western</option>
                        </Select>
                        <Select value={bedTypeFilter} onChange={(e) => setBedTypeFilter(e.target.value)} icon={<FaBed color="blue" />}>
                            <option value="All">All Bed Types</option>
                            <option value="Queen">Queen</option>
                            <option value="Twin">Twin</option>
                        </Select>
                    </SimpleGrid>
                </Box>

                <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                    {filteredRooms.map((room) => (
                        <RoomCard key={room.room} room={room} />
                    ))}
                </SimpleGrid>
            </VStack>

            <Flex position="fixed" bottom="20px" right="20px" zIndex={10}>
                <Button
                    leftIcon={<FaShoppingCart />}
                    colorScheme="blue"
                    onClick={() => setIsDrawerOpen(true)}
                    mr={4}
                >
                    Selected Rooms ({selectedRooms.length})
                </Button>
                <Button
                    colorScheme="green"
                    onClick={handleProceed}
                    boxShadow="lg"
                >
                    Proceed to Booking
                </Button>
            </Flex>

            <Drawer isOpen={isDrawerOpen} placement="right" onClose={() => setIsDrawerOpen(false)}>
                <DrawerOverlay />
                <DrawerContent>
                    <DrawerCloseButton />
                    <DrawerHeader>Selected Rooms</DrawerHeader>
                    <DrawerBody>
                        {selectedRooms.map((room) => (
                            <Box key={room.room} mb={4} p={4} borderWidth="1px" borderRadius="md" boxShadow="sm">
                                <Flex alignItems="center" mb={2}>
                                    <Icon as={FaBed} mr={2} color="blue.500" />
                                    <Text fontWeight="bold">Room {room.room}</Text>
                                </Flex>
                                <Tag colorScheme="blue" mb={2}>{room.roomType}</Tag>
                                <HStack spacing={2} mb={2}>
                                    <Tag size="sm" variant="outline"><Icon as={FaEye} mr={1} />{room.viewType}</Tag>
                                    <Tag size="sm" variant="outline"><Icon as={FaCouch} mr={1} />{room.bedType}</Tag>
                                    <Tag size="sm" variant="outline"><Icon as={FaBath} mr={1} />{room.bathroomType}</Tag>
                                </HStack>
                                <Flex justifyContent="space-between" alignItems="center">
                                    <Text fontWeight="bold" color="green.500">₹{room.costPerDay.toFixed(2)}</Text>
                                    <Text fontSize="sm" color="gray.500">per night</Text>
                                </Flex>
                            </Box>
                        ))}
                    </DrawerBody>
                </DrawerContent>
            </Drawer>
        </Box>
    );
};

export default Bookings;

