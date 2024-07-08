import React, { useState, useEffect } from 'react';
import {
    Box,
    SimpleGrid,
    Text,
    Flex,
    Tag,
    useColorModeValue,
    Select,
    Button,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
    FormControl,
    HStack,
    IconButton,
    Skeleton,
    SkeletonText,
    TagLabel,
    TagLeftIcon,
    FormLabel,
    Input,
    useDisclosure,
    VStack,
} from '@chakra-ui/react';
import { FaEdit, FaTrashAlt, FaLayerGroup, FaInfoCircle, FaPlus, FaBed, FaEye, FaBath, FaSave, FaTimes } from 'react-icons/fa';


const FilterCard = ({ onFilterChange }) => {
    return (
        <Box p={4} bg={useColorModeValue('white', 'gray.700')} borderRadius="lg" boxShadow="md" mb={4}>
            <SimpleGrid columns={{ base: 1, md: 2, lg: 5 }} spacing={4}>
                <Select placeholder="Room Type" onChange={(e) => onFilterChange('roomType', e.target.value)}>
                    <option value="AC">AC</option>
                    <option value="Non AC">Non AC</option>
                    <option value="Deluxe">Deluxe</option>
                </Select>
                <Select placeholder="View Type" onChange={(e) => onFilterChange('view', e.target.value)}>
                    <option value="Balcony">Balcony</option>
                    <option value="Parking">Parking</option>
                    <option value="City">City</option>
                </Select>
                <Select placeholder="Bathroom Type" onChange={(e) => onFilterChange('bathroom', e.target.value)}>
                    <option value="Indian">Indian</option>
                    <option value="Western">Western</option>
                </Select>
                <Select placeholder="Bed Type" onChange={(e) => onFilterChange('bed', e.target.value)}>
                    <option value="Queen">Queen</option>
                    <option value="Twin">Twin</option>
                </Select>
                <Select placeholder="Floor" onChange={(e) => onFilterChange('floor', e.target.value)}>
                    <option value="1">1</option>
                    <option value="2">2</option>
                </Select>
            </SimpleGrid>
        </Box>
    );
};

const RoomCard = ({ room, onEdit, onDelete }) => {
    const bgColor = useColorModeValue('white', 'gray.700');
    const textColor = useColorModeValue('gray.800', 'white');
    const borderColor = useColorModeValue('gray.200', 'gray.600');
    const iconColor = useColorModeValue('#007bff', '#4299E1');

    return (
        <Box
            borderWidth="1px"
            borderRadius="lg"
            overflow="hidden"
            bg={bgColor}
            boxShadow="md"
            transition="all 0.3s"
            _hover={{ transform: 'translateY(-5px)', boxShadow: 'lg' }}
        >
            <Flex justifyContent="space-between" alignItems="center" p={3} borderBottomWidth="1px" borderColor={borderColor}>
                <Box>
                    <Text fontSize="lg" fontWeight="bold" color={textColor}>{room.roomNumber}</Text>
                    <Text fontSize="sm" color={useColorModeValue('gray.500', 'gray.400')}>{room.roomType}</Text>
                </Box>
                <Flex>
                    <FaEdit cursor="pointer" color={iconColor} style={{ marginRight: '10px' }} onClick={() => onEdit(room)} />
                    <FaTrashAlt cursor="pointer" color={iconColor} onClick={() => onDelete(room.roomNumber)} />
                </Flex>
            </Flex>
            <Box p={3}>
                <Flex alignItems="center" mb={2}>
                    <FaLayerGroup color={iconColor} style={{ marginRight: '10px' }} />
                    <Text fontSize="sm" color={textColor}><strong>Floor:</strong> {room.floor}</Text>
                </Flex>
                <Flex alignItems="center" mb={2}>
                    <FaInfoCircle color={iconColor} style={{ marginRight: '10px' }} />
                    <Text fontSize="sm" color={textColor}><strong>Status:</strong> {room.roomStatus}</Text>
                </Flex>
                <Flex mt={2} flexWrap="wrap">
                    <Tag size="sm" mr={2} mb={2} bg={useColorModeValue('#a1c4fd', '#4A5568')} color={useColorModeValue('gray.800', 'white')}>{room.bed}</Tag>
                    <Tag size="sm" mr={2} mb={2} bg={useColorModeValue('#d4fc79', '#68D391')} color={useColorModeValue('gray.800', 'gray.800')}>{room.view}</Tag>
                    <Tag size="sm" mr={2} mb={2} bg={useColorModeValue('#f8b195', '#F56565')} color={useColorModeValue('gray.800', 'white')}>{room.bathroom}</Tag>
                </Flex>
            </Box>
        </Box>
    );
};


const RoomModal = ({ isOpen, onClose, room, onSave, roomNumber, floor, view, bathroom, bed }) => {
    const [roomData, setRoomData] = useState(room || {});

    const handleChange = (e) => {
        const { name, value } = e.target;
        setRoomData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = () => {
        onSave(roomData);
        onClose();
    };

    const bgColor = useColorModeValue('white', 'gray.700');
    const iconColor = useColorModeValue('gray.600', 'gray.300');

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="xl">
            <ModalOverlay />
            <ModalContent bg={bgColor}>
                <ModalHeader>{room ? 'Edit Room' : 'Add Room'}</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <VStack spacing={6} align="stretch">
                        <SimpleGrid columns={2} spacing={4}>
                            <FormControl>
                                <FormLabel>
                                    <HStack>
                                        <FaLayerGroup color={iconColor} />
                                        <span>Room Number</span>
                                    </HStack>
                                </FormLabel>
                                <Input name="roomNumber" value={roomNumber || ''} onChange={handleChange} />
                            </FormControl>
                            <FormControl>
                                <FormLabel>
                                    <HStack>
                                        <FaLayerGroup color={iconColor} />
                                        <span>Floor</span>
                                    </HStack>
                                </FormLabel>
                                <Select
                                    name="floor"
                                    value={floor || ''}
                                    onChange={handleChange}
                                    placeholder="Select Floor"
                                >
                                    <option value="1">
                                        <Tag size="lg" colorScheme="blue">
                                            <TagLeftIcon as={FaLayerGroup} />
                                            <TagLabel>1</TagLabel>
                                        </Tag>
                                    </option>
                                    <option value="2">
                                        <Tag size="lg" colorScheme="green">
                                            <TagLeftIcon as={FaLayerGroup} />
                                            <TagLabel>2</TagLabel>
                                        </Tag>
                                    </option>
                                </Select>
                            </FormControl>
                        </SimpleGrid>
                        <SimpleGrid columns={2} spacing={4}>
                            <FormControl>
                                <FormLabel>
                                    <HStack>
                                        <FaBed color={iconColor} />
                                        <span>Bed Type</span>
                                    </HStack>
                                </FormLabel>
                                <Select name="bed" value={bed || ''} onChange={handleChange} placeholder="Select Bed">
                                    <option value="Queen">
                                        <Tag size="lg" colorScheme="purple">
                                            <TagLeftIcon as={FaBed} />
                                            <TagLabel>Queen</TagLabel>
                                        </Tag>
                                    </option>
                                    <option value="Twin">
                                        <Tag size="lg" colorScheme="orange">
                                            <TagLeftIcon as={FaBed} />
                                            <TagLabel>Twin</TagLabel>
                                        </Tag>
                                    </option>
                                </Select>
                            </FormControl>
                            <FormControl>
                                <FormLabel>
                                    <HStack>
                                        <FaEye color={iconColor} />
                                        <span>View Type</span>
                                    </HStack>
                                </FormLabel>
                                <Select name="view" value={view || ''} onChange={handleChange} placeholder="Select View">
                                    <option value="Balcony">
                                        <Tag size="lg" colorScheme="teal">
                                            <TagLeftIcon as={FaEye} />
                                            <TagLabel>Balcony</TagLabel>
                                        </Tag>
                                    </option>
                                    <option value="Parking">
                                        <Tag size="lg" colorScheme="gray">
                                            <TagLeftIcon as={FaEye} />
                                            <TagLabel>Parking</TagLabel>
                                        </Tag>
                                    </option>
                                    <option value="City">
                                        <Tag size="lg" colorScheme="yellow">
                                            <TagLeftIcon as={FaEye} />
                                            <TagLabel>City</TagLabel>
                                        </Tag>
                                    </option>
                                </Select>
                            </FormControl>
                        </SimpleGrid>
                        <FormControl>
                            <FormLabel>
                                <HStack>
                                    <FaBath color={iconColor} />
                                    <span>Bathroom Type</span>
                                </HStack>
                            </FormLabel>
                            <Select
                                name="bathroom"
                                value={bathroom || ''}
                                onChange={handleChange}
                                placeholder="Select Bathroom"
                            >
                                <option value="Indian">
                                    <Tag size="lg" colorScheme="red">
                                        <TagLeftIcon as={FaBath} />
                                        <TagLabel>Indian</TagLabel>
                                    </Tag>
                                </option>
                                <option value="Western">
                                    <Tag size="lg" colorScheme="green">
                                        <TagLeftIcon as={FaBath} />
                                        <TagLabel>Western</TagLabel>
                                    </Tag>
                                </option>
                            </Select>
                        </FormControl>
                    </VStack>
                </ModalBody>
                <ModalFooter>
                    <HStack spacing={4}>
                        <IconButton icon={<FaSave />} colorScheme="blue" onClick={handleSubmit}>
                            Save
                        </IconButton>
                        <IconButton icon={<FaTimes />} onClick={onClose}>
                            Cancel
                        </IconButton>
                    </HStack>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};

const SkeletonRoomCard = () => {
    const bgColor = useColorModeValue('white', 'gray.700');
    const borderColor = useColorModeValue('gray.200', 'gray.600');

    return (
        <Box
            borderWidth="1px"
            borderRadius="lg"
            overflow="hidden"
            bg={bgColor}
            boxShadow="md"
        >
            <Flex justifyContent="space-between" alignItems="center" p={3} borderBottomWidth="1px" borderColor={borderColor}>
                <Box>
                    <Skeleton height="24px" width="100px" mb={2} />
                    <Skeleton height="16px" width="80px" />
                </Box>
                <Skeleton height="24px" width="50px" />
            </Flex>
            <Box p={3}>
                <SkeletonText mt="2" noOfLines={2} spacing="4" />
                <Flex mt={4} flexWrap="wrap">
                    <Skeleton height="20px" width="60px" mr={2} mb={2} />
                    <Skeleton height="20px" width="70px" mr={2} mb={2} />
                    <Skeleton height="20px" width="80px" mb={2} />
                </Flex>
            </Box>
        </Box>
    );
};



const Rooms = ({ authToken }) => {
    const [rooms, setRooms] = useState([]);
    const [filteredRooms, setFilteredRooms] = useState([]);
    const [filters, setFilters] = useState({});
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [currentRoom, setCurrentRoom] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [roomsPerPage] = useState(12);
    const [isLoading, setIsLoading] = useState(true);
    const totalPages = Math.ceil(filteredRooms.length / roomsPerPage);

    useEffect(() => {
        fetchRooms();
    }, [authToken]);


    const fetchRooms = async () => {
        setIsLoading(true); // Set loading to true while fetching
        try {
            const response = await fetch('http://ec2-54-211-23-206.compute-1.amazonaws.com:8081/rooms/getAll', {
                headers: {
                    'Authorization': `Bearer ${authToken}`
                }
            });
            if (!response.ok) {
                throw new Error('Failed to fetch rooms');
            }
            const data = await response.json();
            setRooms(data);
            setFilteredRooms(data);
        } catch (error) {
            console.error('Error fetching rooms:', error);
        }
        setIsLoading(false); // Set loading to false after fetching
    };

    const applyFilters = () => {
        let filtered = rooms;
        Object.entries(filters).forEach(([key, value]) => {
            if (value) {
                filtered = filtered.filter(room => room[key] === value);
            }
        });
        setFilteredRooms(filtered);
    };

    const handleFilterChange = (filterName, value) => {
        setFilters(prev => ({ ...prev, [filterName]: value }));
    };

    const handleAddRoom = () => {
        setCurrentRoom(null);
        onOpen();
    };

    const handleEditRoom = (room) => {
        setCurrentRoom(room);
        onOpen();
    };

    const handleDeleteRoom = async (roomNumber) => {
        try {
            const response = await fetch(`http://ec2-54-211-23-206.compute-1.amazonaws.com:8081/rooms/deleteByRoomNumber?roomNumber=${roomNumber}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${authToken}`
                }
            });
            if (!response.ok) {
                throw new Error('Failed to delete room');
            }
            fetchRooms();
        } catch (error) {
            console.error('Error deleting room:', error);
        }
    };

    const handleSaveRoom = async (roomData) => {
        try {
            const url = currentRoom
                ? `http://ec2-54-211-23-206.compute-1.amazonaws.com:8081/rooms/editRoom?roomNumber=${currentRoom.roomNumber}`
                : 'http://ec2-54-211-23-206.compute-1.amazonaws.com:8081/rooms/add';
            const method = currentRoom ? 'PUT' : 'POST';
            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                },
                body: JSON.stringify(roomData)
            });
            if (!response.ok) {
                throw new Error('Failed to save room');
            }
            fetchRooms();
        } catch (error) {
            console.error('Error saving room:', error);
        }
    };

    const indexOfLastRoom = currentPage * roomsPerPage;
    const indexOfFirstRoom = indexOfLastRoom - roomsPerPage;
    const currentRooms = filteredRooms.slice(indexOfFirstRoom, indexOfLastRoom);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    return (
        <Box p={4} mt={4}>  {/* Reduced mt from 16 to 4 */}
            <Flex justifyContent="flex-end" mb={4}>
                <Button leftIcon={<FaPlus />} colorScheme="blue" onClick={handleAddRoom}>
                    Add Room
                </Button>
            </Flex>
            <FilterCard onFilterChange={handleFilterChange} />
            <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing={4}>
                {isLoading ? (
                    Array.from({ length: roomsPerPage }).map((_, index) => (
                        <SkeletonRoomCard key={index} />
                    ))
                ) : (
                    currentRooms.map((room) => (
                        <RoomCard key={room.roomNumber} room={room} onEdit={handleEditRoom} onDelete={handleDeleteRoom} />
                    ))
                )}
            </SimpleGrid>
            <Flex justifyContent="center" mt={8}>
                <Button
                    onClick={() => paginate(currentPage - 1)}
                    disabled={currentPage === 1}
                    mr={4}
                >
                    Previous
                </Button>
                <Box>
                    Page {currentPage} of {totalPages}
                </Box>
                <Button
                    onClick={() => paginate(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    ml={4}
                >
                    Next
                </Button>
            </Flex>
            <RoomModal
                isOpen={isOpen}
                onClose={onClose}
                room={currentRoom}
                onSave={handleSaveRoom}
                roomNumber={currentRoom ? currentRoom.roomNumber : ''}
                floor={currentRoom ? currentRoom.floor : ''}
                view={currentRoom ? currentRoom.view : ''}
                bathroom={currentRoom ? currentRoom.bathroom : ''}
                bed={currentRoom ? currentRoom.bed : ''}
            />
        </Box>
    );
};

export default Rooms;