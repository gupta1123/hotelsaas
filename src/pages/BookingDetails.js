import React, { useState, useEffect } from 'react';
import {
    Box, VStack, HStack, Text, Heading, Button, Icon, Flex, Spacer,
    useColorModeValue, SimpleGrid, Input, Select, NumberInput, NumberInputField,
    NumberInputStepper, NumberIncrementStepper, NumberDecrementStepper,
    FormControl, FormLabel, Divider, Radio, RadioGroup, useToast, Tag,
    InputGroup, InputLeftElement, ButtonGroup, Badge
} from '@chakra-ui/react';
import {
    FaBed, FaCalendarAlt, FaClock, FaUsers, FaChild, FaIdCard, FaMoneyBillWave,
    FaPhone, FaEnvelope, FaMapMarkerAlt, FaCity, FaGlobe, FaMapPin,
    FaPassport, FaUtensils, FaPercent, FaTag, FaUser
} from 'react-icons/fa';
import { useHistory, useLocation } from 'react-router-dom';
import axios from 'axios';
import moment from 'moment';
import CountrySelect from '../components/CountrySelect';
import PromoCode from './PromoCode';

const BookingDetails = ({ authToken }) => {
    const location = useLocation();
    const { selectedRooms, checkInDate, checkOutDate, checkInTime, checkOutTime, adults, children } = location.state || {};
    const history = useHistory();
    const toast = useToast();
    const [isFormValid, setIsFormValid] = useState(false);

    const [guestDetails, setGuestDetails] = useState({
        phoneNumber: '',
        title: '',
        firstName: '',
        lastName: '',
        email: '',
        address: '',
        city: '',
        state: '',
        country: '',
        pincode: '',
        idType: '',
        idNumber: '',
        gstNumber: '',
    });

    const [discount, setDiscount] = useState(0);
    const [selectedOfferId, setSelectedOfferId] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [rooms, setRooms] = useState(selectedRooms.map(room => ({
        ...room,
        adults: adults || room.adults || 1,
        children: children || room.children || 0,
        addons: {
            mattress: adults === 3 ? 1 : 0,
            breakfast: 0,
        },
        roomPrice: room.roomType,
    })));

    const bgColor = useColorModeValue('white', 'gray.700');
    const textColor = useColorModeValue('gray.800', 'white');
    const borderColor = useColorModeValue('gray.200', 'gray.600');
    const iconColor = useColorModeValue('blue.500', 'blue.300');

    const handleAdultChange = (value, index) => {
        const updatedRooms = [...rooms];
        updatedRooms[index].adults = value;
        updatedRooms[index].addons.mattress = value === 3 ? 1 : 0;
        setRooms(updatedRooms);
    };

    const handleChildrenChange = (value, index) => {
        const updatedRooms = [...rooms];
        updatedRooms[index].children = value;
        setRooms(updatedRooms);
    };

    const handleAddonChange = (value, index, addonType) => {
        const updatedRooms = [...rooms];
        updatedRooms[index].addons[addonType] = value;
        setRooms(updatedRooms);
    };

    const handleRoomPriceChange = (value, index) => {
        const updatedRooms = [...rooms];
        updatedRooms[index].roomPrice = value;
        setRooms(updatedRooms);
    };

    const constructBookingData = () => {
        return rooms.map(room => ({
            customer: {
                title: guestDetails.title,
                firstName: guestDetails.firstName,
                lastName: guestDetails.lastName,
                email: guestDetails.email,
                address: guestDetails.address,
                city: guestDetails.city,
                state: guestDetails.state,
                country: guestDetails.country,
                phoneNumber: guestDetails.phoneNumber,
                pincode: guestDetails.pincode,
                gstNumber: guestDetails.gstNumber,
                customerDocs: {
                    [guestDetails.idType]: guestDetails.idNumber
                },
                age: guestDetails.age
            },
            booking: {
                roomNumber: room.room,
                custId: 2,
                totalGuestCount: room.adults + room.children,
                checkIn: checkInDate,
                checkOut: checkOutDate,
                checkInTime: checkInTime,
                checkOutTime: checkInTime,
                gstNumber: guestDetails.gstNumber,
                discount: discount,
                offerId: selectedOfferId || null,
                toggleRoomType: room.roomPrice,
                addOnMap: {
                    mattress: room.addons.mattress,
                    breakfast: room.addons.breakfast
                }
            }
        }));
    };

    useEffect(() => {
        // Validate form
        const isValid = 
            (typeof guestDetails.phoneNumber === 'string' ? guestDetails.phoneNumber.trim() : String(guestDetails.phoneNumber).trim()) !== '' && 
            guestDetails.firstName.trim() !== '';
        setIsFormValid(isValid);
    }, [guestDetails.phoneNumber, guestDetails.firstName]);



    const handleConfirmBooking = async () => {
        const bookingData = constructBookingData();
        const isGroup = rooms.length > 1;

        const apiUrl = `http://ec2-54-211-23-206.compute-1.amazonaws.com:8081/reservation/addGroupNested?isGroup=${isGroup}`;

        try {
            setIsLoading(true);
            const response = await axios.put(apiUrl, bookingData, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`,
                },
            });

            const bookingId = response.data;

            if (bookingId) {
                const isGroupBooking = isGroup;
                const idToUse = isGroupBooking ? bookingId.split(':')[0] : bookingId;
                const routeToUse = isGroupBooking ? `/group-booking/${idToUse}` : `/booking/${idToUse}`;
                history.push(routeToUse);
            } else {
                console.error('Booking data is not in the expected format');
                toast({
                    title: "Error",
                    description: "Unable to confirm this booking. Invalid data format.",
                    status: "error",
                    duration: 3000,
                    isClosable: true,
                });
            }

            toast({
                title: "Booking Confirmed",
                description: "Your booking has been successfully created.",
                status: "success",
                duration: 5000,
                isClosable: true,
            });

        } catch (error) {
            console.error("Error during booking confirmation:", error);
            toast({
                title: "Booking Error",
                description: "There was an error confirming your booking. Please try again.",
                status: "error",
                duration: 5000,
                isClosable: true,
            });
        } finally {
            setIsLoading(false);
        }
    };

    const triggerGetByPhoneAPI = async () => {
        const phoneNumber = typeof guestDetails.phoneNumber === 'string' ? guestDetails.phoneNumber : String(guestDetails.phoneNumber);
        if (phoneNumber.length > 0) {
            setIsLoading(true);
            try {
                const response = await axios.get(`http://ec2-54-211-23-206.compute-1.amazonaws.com:8081/customers/getByPhone?phone=${phoneNumber}`, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${authToken}`,
                    },
                });

                if (response.data && Object.keys(response.data).length > 0 && response.data.phoneNumber) {
                    const { customerDocs } = response.data;
                    let idType = '', idNumber = '';

                    if (customerDocs && Object.keys(customerDocs).length > 0) {
                        const [firstDocType, firstDocNumber] = Object.entries(customerDocs)[0];
                        idType = firstDocType;
                        idNumber = firstDocNumber;
                    }

                    setGuestDetails(prevDetails => ({
                        ...prevDetails,
                        ...response.data,
                        idType,
                        idNumber,
                    }));
                    toast({
                        title: "Guest Found",
                        description: "Guest details have been loaded.",
                        status: "success",
                        duration: 3000,
                        isClosable: true,
                    });
                } else {
                    toast({
                        title: "Guest Not Found",
                        description: "Please enter guest details manually.",
                        status: "info",
                        duration: 3000,
                        isClosable: true,
                    });
                    setGuestDetails(prevDetails => ({
                        ...prevDetails,
                        title: '', firstName: '', lastName: '', email: '', address: '', city: '', state: '', country: '', pincode: '', idType: '', idNumber: '', gstNumber: '',
                    }));
                }
            } catch (error) {
                console.error("Error fetching guest details:", error);
                toast({
                    title: "Error",
                    description: "There was an error fetching guest details. Please try again.",
                    status: "error",
                    duration: 5000,
                    isClosable: true,
                });
                setGuestDetails({
                    phoneNumber: '',
                    title: '',
                    firstName: '',
                    lastName: '',
                    email: '',
                    address: '',
                    city: '',
                    state: '',
                    country: '',
                    pincode: '',
                    idType: '',
                    idNumber: '',
                    gstNumber: '',
                });
            } finally {
                setIsLoading(false);
            }
        }
    };

    const RoomCard = ({ room, index }) => (
        <Box
            bg={bgColor}
            p={6}
            borderRadius="md"
            boxShadow="md"
            mb={6}
        >
            <Flex alignItems="center" mb={4}>
                <Icon as={FaBed} mr={2} color={iconColor} />
                <Heading size="md" color={textColor}>Room {room.room} - {room.roomType}</Heading>
                <Spacer />
                <ButtonGroup size="sm" isAttached variant="outline">
                    {['AC', 'Non AC', 'Deluxe'].map((type) => (
                        <Button
                            key={type}
                            onClick={() => handleRoomPriceChange(type, index)}
                            colorScheme={room.roomPrice === type ? "blue" : "gray"}
                            transition="all 0.2s"
                            transform={room.roomPrice === type ? "scale(1.05)" : "scale(1)"}
                            fontWeight={room.roomPrice === type ? "bold" : "normal"}
                            _hover={{
                                transform: "scale(1.05)",
                                boxShadow: "md",
                            }}
                        >
                            {type}
                        </Button>
                    ))}
                </ButtonGroup>
            </Flex>
            <SimpleGrid columns={2} spacing={4} mb={4}>
                <HStack>
                    <Icon as={FaCalendarAlt} color={iconColor} />
                    <Text color={textColor}>Check-in: {moment(checkInDate).format('DD MMM YYYY')} {checkInTime}</Text>
                </HStack>
                <HStack>
                    <Icon as={FaCalendarAlt} color={iconColor} />
                    <Text color={textColor}>Check-out: {moment(checkOutDate).format('DD MMM YYYY')} {checkOutTime}</Text>
                </HStack>
            </SimpleGrid>
            <HStack spacing={4} align="flex-end">
                <FormControl>
                    <FormLabel color={textColor}><Icon as={FaUsers} mr={2} color={iconColor} />Adults</FormLabel>
                    <NumberInput min={1} max={3} value={room.adults} onChange={(value) => handleAdultChange(parseInt(value), index)}>
                        <NumberInputField />
                        <NumberInputStepper>
                            <NumberIncrementStepper />
                            <NumberDecrementStepper />
                        </NumberInputStepper>
                    </NumberInput>
                </FormControl>
                <FormControl>
                    <FormLabel color={textColor}><Icon as={FaChild} mr={2} color={iconColor} />Children</FormLabel>
                    <NumberInput min={0} max={3} value={room.children} onChange={(value) => handleChildrenChange(parseInt(value), index)}>
                        <NumberInputField />
                        <NumberInputStepper>
                            <NumberIncrementStepper />
                            <NumberDecrementStepper />
                        </NumberInputStepper>
                    </NumberInput>
                </FormControl>
                <FormControl>
                    <FormLabel color={textColor}><Icon as={FaBed} mr={2} color={iconColor} />Mattress</FormLabel>
                    <NumberInput
                        min={0}
                        max={3}
                        value={room.addons.mattress}
                        onChange={(value) => handleAddonChange(parseInt(value), index, 'mattress')}
                        isDisabled={room.adults === 3}
                    >
                        <NumberInputField />
                        <NumberInputStepper>
                            <NumberIncrementStepper />
                            <NumberDecrementStepper />
                        </NumberInputStepper>
                    </NumberInput>
                </FormControl>
                <FormControl>
                    <FormLabel color={textColor}><Icon as={FaUtensils} mr={2} color={iconColor} />Breakfast</FormLabel>
                    <NumberInput
                        min={0}
                        max={3}
                        value={room.addons.breakfast}
                        onChange={(value) => handleAddonChange(parseInt(value), index, 'breakfast')}
                    >
                        <NumberInputField />
                        <NumberInputStepper>
                            <NumberIncrementStepper />
                            <NumberDecrementStepper />
                        </NumberInputStepper>
                    </NumberInput>
                </FormControl>
            </HStack>
        </Box>
    );

    return (
        <Box p={5}>
            <VStack spacing={6} align="stretch">
                <Flex alignItems="center" justifyContent="space-between">
                    <Heading size="xl" color={textColor}>Booking Details</Heading>
                    <Badge colorScheme={rooms.length > 1 ? "green" : "blue"} fontSize="md" p={2} borderRadius="md">
                        {rooms.length > 1 ? "Group Booking" : "Single Booking"}
                    </Badge>
                </Flex>

                <Box bg={bgColor} p={6} borderRadius="md" boxShadow="md">
                    <Heading size="md" mb={4} color={textColor}>Guest Details</Heading>
                    <SimpleGrid columns={[1, 2, 3]} spacing={4}>
                    <FormControl isRequired>
    <FormLabel color={textColor}><Icon as={FaPhone} mr={2} color={iconColor} />Phone Number</FormLabel>
    <InputGroup>
        <InputLeftElement pointerEvents="none" children={<FaPhone color={iconColor} />} />
        <Input
            value={String(guestDetails.phoneNumber)}
            onChange={(e) => setGuestDetails({ ...guestDetails, phoneNumber: e.target.value })}
            onBlur={triggerGetByPhoneAPI}
            placeholder="Enter phone number"
        />
    </InputGroup>
</FormControl>
                        <FormControl>
                            <FormLabel color={textColor}><Icon as={FaUser} mr={2} color={iconColor} />Title</FormLabel>
                            <Select
                                value={guestDetails.title}
                                onChange={(e) => setGuestDetails({ ...guestDetails, title: e.target.value })}
                                placeholder="Select a title"
                            >
                                <option value="Mr.">Mr.</option>
                                <option value="Miss">Miss</option>
                                <option value="Mrs.">Mrs.</option>
                            </Select>
                        </FormControl>
                        <FormControl>
                            <FormLabel color={textColor}><Icon as={FaUser} mr={2} color={iconColor} />First Name</FormLabel>
                            <Input
                                value={guestDetails.firstName}
                                onChange={(e) => setGuestDetails({ ...guestDetails, firstName: e.target.value })}
                                placeholder="First Name"
                            />
                        </FormControl>
                        <FormControl>
                            <FormLabel color={textColor}><Icon as={FaUser} mr={2} color={iconColor} />Last Name</FormLabel>
                            <Input
                                value={guestDetails.lastName}
                                onChange={(e) => setGuestDetails({ ...guestDetails, lastName: e.target.value })}
                                placeholder="Last Name"
                            />
                        </FormControl>
                        <FormControl>
                            <FormLabel color={textColor}><Icon as={FaEnvelope} mr={2} color={iconColor} />Email</FormLabel>
                            <InputGroup>
                                <InputLeftElement pointerEvents="none" children={<FaEnvelope color={iconColor} />} />
                                <Input
                                    value={guestDetails.email}
                                    onChange={(e) => setGuestDetails({ ...guestDetails, email: e.target.value })}
                                    placeholder="Email"
                                    type="email"
                                />
                            </InputGroup>
                        </FormControl>
                        <FormControl>
                            <FormLabel color={textColor}><Icon as={FaMapMarkerAlt} mr={2} color={iconColor} />Address</FormLabel>
                            <Input
                                value={guestDetails.address}
                                onChange={(e) => setGuestDetails({ ...guestDetails, address: e.target.value })}
                                placeholder="Address"
                            />
                        </FormControl>
                        <FormControl>
                            <FormLabel color={textColor}><Icon as={FaCity} mr={2} color={iconColor} />City</FormLabel>
                            <Input
                                value={guestDetails.city}
                                onChange={(e) => setGuestDetails({ ...guestDetails, city: e.target.value })}
                                placeholder="City"
                            />
                        </FormControl>
                        <FormControl>
                            <FormLabel color={textColor}><Icon as={FaGlobe} mr={2} color={iconColor} />State</FormLabel>
                            <Input
                                value={guestDetails.state}
                                onChange={(e) => setGuestDetails({ ...guestDetails, state: e.target.value })}
                                placeholder="State"
                            />
                        </FormControl>
                        <FormControl>
                            <FormLabel color={textColor}><Icon as={FaGlobe} mr={2} color={iconColor} />Country</FormLabel>
                            <CountrySelect
                                value={guestDetails.country}
                                onChange={(selectedOption) => {
                                    setGuestDetails({
                                        ...guestDetails,
                                        country: selectedOption ? selectedOption.label : ''
                                    });
                                }}
                            />
                        </FormControl>
                        <FormControl>
                            <FormLabel color={textColor}><Icon as={FaMapPin} mr={2} color={iconColor} />Pincode</FormLabel>
                            <Input
                                value={guestDetails.pincode}
                                onChange={(e) => setGuestDetails({ ...guestDetails, pincode: e.target.value })}
                                placeholder="Pincode"
                            />
                        </FormControl>
                        <FormControl>
                            <FormLabel color={textColor}><Icon as={FaIdCard} mr={2} color={iconColor} />ID Type</FormLabel>
                            <Select
                                value={guestDetails.idType}
                                onChange={(e) => setGuestDetails({ ...guestDetails, idType: e.target.value })}
                                placeholder="Select an ID Type"
                            >
                                <option value="Aadhar Card">Aadhar Card</option>
                                <option value="PAN Card">PAN Card</option>
                                <option value="Passport">Passport</option>
                                <option value="Driving License">Driving License</option>
                            </Select>
                        </FormControl>
                        <FormControl>
                            <FormLabel color={textColor}><Icon as={FaPassport} mr={2} color={iconColor} />ID Number</FormLabel>
                            <Input
                                value={guestDetails.idNumber}
                                onChange={(e) => setGuestDetails({ ...guestDetails, idNumber: e.target.value })}
                                placeholder="Enter ID Number"
                            />
                        </FormControl>
                    </SimpleGrid>
                </Box>

                <Box bg={bgColor} p={6} borderRadius="md" boxShadow="md">
                    <Heading size="md" mb={4} color={textColor}>Additional Details</Heading>
                    <SimpleGrid columns={[1, 2, 3]} spacing={4}>
                        <FormControl>
                            <FormLabel color={textColor}><Icon as={FaIdCard} mr={2} color={iconColor} />GST Number</FormLabel>
                            <Input
                                value={guestDetails.gstNumber}
                                onChange={(e) => setGuestDetails({ ...guestDetails, gstNumber: e.target.value })}
                                placeholder="GST Number"
                            />
                        </FormControl>
                        <FormControl>
                            <FormLabel color={textColor}><Icon as={FaPercent} mr={2} color={iconColor} />Discount</FormLabel>
                            <NumberInput value={discount} onChange={(value) => setDiscount(parseFloat(value))}>
                                <NumberInputField />
                                <NumberInputStepper>
                                    <NumberIncrementStepper />
                                    <NumberDecrementStepper />
                                </NumberInputStepper>
                            </NumberInput>
                        </FormControl>
                        <FormControl>
                            <FormLabel color={textColor}><Icon as={FaTag} mr={2} color={iconColor} />Promo Code</FormLabel>
                            <PromoCode
                                authToken={authToken}
                                setSelectedOfferId={setSelectedOfferId}
                                selectedOfferId={selectedOfferId}
                            />
                        </FormControl>
                    </SimpleGrid>
                </Box>

                <Heading size="md" color={textColor}>Selected Rooms</Heading>
                {rooms.map((room, index) => (
                    <RoomCard key={room.room} room={room} index={index} />
                ))}

                <Flex justifyContent="flex-end" mt={8}>
                    <Button
                        colorScheme="blue"
                        size="lg"
                        onClick={handleConfirmBooking}
                        leftIcon={<Icon as={FaMoneyBillWave} />}
                        isLoading={isLoading}
                        isDisabled={!isFormValid}
                    >
                        Confirm Booking
                    </Button>
                </Flex>
            </VStack>
        </Box>
    );
};

export default BookingDetails;