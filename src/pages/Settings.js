import React, { useState, useEffect } from 'react';
import {
    Box,
    Tabs,
    TabList,
    TabPanels,
    Tab,
    TabPanel,
    SimpleGrid,
    Text,
    Button,
    useColorModeValue,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
    FormControl,
    FormLabel,
    Input,
    useDisclosure,
    VStack
} from '@chakra-ui/react';
import { FaEdit } from 'react-icons/fa';
import Offers from './Offers';

const PriceCard = ({ title, price, onEdit }) => {
    const bgGradient = useColorModeValue(
        'linear(to-br, blue.400, purple.500)',
        'linear(to-br, blue.600, purple.700)'
    );
    const textColor = useColorModeValue('white', 'gray.100');

    return (
        <Box
            borderRadius="lg"
            overflow="hidden"
            position="relative"
            bgGradient={bgGradient}
            boxShadow="lg"
            transition="transform 0.3s"
            _hover={{ transform: 'translateY(-5px)' }}
        >
            <Box position="absolute" top="0" left="0" right="0" bottom="0" opacity="0.2">
                <Box
                    position="absolute"
                    width="200px"
                    height="200px"
                    bg="rgba(255, 255, 255, 0.2)"
                    borderRadius="full"
                    top="-50px"
                    left="-50px"
                />
                <Box
                    position="absolute"
                    width="200px"
                    height="200px"
                    bg="rgba(255, 255, 255, 0.1)"
                    borderRadius="full"
                    bottom="-50px"
                    right="-50px"
                />
            </Box>
            <Box p={5} position="relative" color={textColor}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                    <Text fontSize="xl" fontWeight="bold">{title}</Text>
                    <Button
                        leftIcon={<FaEdit />}
                        size="sm"
                        onClick={onEdit}
                        bg="rgba(255, 255, 255, 0.2)"
                        _hover={{ bg: 'rgba(255, 255, 255, 0.4)' }}
                    >
                        Edit
                    </Button>
                </Box>
                <Text fontSize="2xl" fontWeight="bold">₹{price}</Text>
            </Box>
        </Box>
    );
};

const Settings = ({ authToken }) => {
    const [roomTypes, setRoomTypes] = useState([]);
    const [addons, setAddons] = useState([]);
    const [gst, setGst] = useState({});
    const [editItem, setEditItem] = useState(null);
    const { isOpen, onOpen, onClose } = useDisclosure();

    const fetchRoomTypes = async () => {
        try {
            const response = await fetch('http://ec2-54-211-23-206.compute-1.amazonaws.com:8081/roomConfig/getAll', {
                headers: { 'Authorization': `Bearer ${authToken}` }
            });
            if (!response.ok) throw new Error('Failed to fetch room types');
            const data = await response.json();
            setRoomTypes(data);
        } catch (error) {
            console.error('Error fetching room types:', error);
        }
    };

    const fetchAddons = async () => {
        try {
            const response = await fetch('http://ec2-54-211-23-206.compute-1.amazonaws.com:8081/addOns/getAll', {
                headers: { 'Authorization': `Bearer ${authToken}` }
            });
            if (!response.ok) throw new Error('Failed to fetch addons');
            const data = await response.json();
            setAddons(data);
        } catch (error) {
            console.error('Error fetching addons:', error);
        }
    };

    const fetchGST = async () => {
        try {
            const response = await fetch('http://ec2-54-211-23-206.compute-1.amazonaws.com:8081/gst/getAll', {
                headers: { 'Authorization': `Bearer ${authToken}` }
            });
            if (!response.ok) throw new Error('Failed to fetch GST');
            const data = await response.json();
            setGst(data.gst);
        } catch (error) {
            console.error('Error fetching GST:', error);
        }
    };

    useEffect(() => {
        fetchRoomTypes();
        fetchAddons();
        fetchGST();
    }, [authToken]);

    const handleEdit = (item, type) => {
        setEditItem({ ...item, type });
        onOpen();
    };

    const handleSave = async () => {
        try {
            let url, body;
            switch (editItem.type) {
                case 'room':
                    url = `http://ec2-54-211-23-206.compute-1.amazonaws.com:8081/roomConfig/updateCost?roomType=${editItem.roomType}&costString=${editItem.costPerDay}`;
                    break;
                case 'addon':
                    url = `http://ec2-54-211-23-206.compute-1.amazonaws.com:8081/addOns/updateCost?addOnName=${editItem.addOnName}&newCost=${editItem.cost}`;
                    break;
                case 'gst':
                    url = `http://ec2-54-211-23-206.compute-1.amazonaws.com:8081/gst/edit?name=${editItem.name}&newGst=${editItem.value}`;
                    break;
            }

            const response = await fetch(url, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${authToken}` }
            });

            if (!response.ok) throw new Error('Failed to update');

            // Refresh data
            fetchRoomTypes();
            fetchAddons();
            fetchGST();

            onClose();
        } catch (error) {
            console.error('Error updating:', error);
        }
    };

    return (
        <Box p={5}>
            <Tabs isFitted variant="enclosed">
                <TabList mb="1em">
                    <Tab>GST Pricing</Tab>
                    <Tab>Rooms Pricing</Tab>
                    <Tab>Addons</Tab>
                    <Tab>Offers</Tab>
                </TabList>
                <TabPanels>
                    <TabPanel>
                        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={10} maxWidth="700px" margin="auto">
                            {Object.entries(gst).map(([key, value]) => (
                                <PriceCard
                                    key={key}
                                    title={key}
                                    price={`${value}%`}
                                    onEdit={() => handleEdit({ name: key, value }, 'gst')}
                                />
                            ))}
                        </SimpleGrid>
                    </TabPanel>
                    <TabPanel>
                        <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing={10}>
                            {roomTypes.map((room) => (
                                <PriceCard
                                    key={room.roomType}
                                    title={room.roomType}
                                    price={room.costPerDay}
                                    onEdit={() => handleEdit(room, 'room')}
                                />
                            ))}
                        </SimpleGrid>
                    </TabPanel>
                    <TabPanel>
                        {addons.length > 0 ? (
                            <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing={10}>
                                {addons.map((addon) => (
                                    <PriceCard
                                        key={addon.name}
                                        title={addon.name}
                                        price={addon.cost}
                                        onEdit={() => handleEdit(addon, 'addon')}
                                    />
                                ))}
                            </SimpleGrid>
                        ) : (
                            <Text>No addons available.</Text>
                        )}
                    </TabPanel>
                    <TabPanel>
                        <Offers authToken={authToken} />
                    </TabPanel>
                </TabPanels>
            </Tabs>

            <Modal isOpen={isOpen} onClose={onClose}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Edit {editItem?.type}</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <VStack spacing={4}>
                            <FormControl>
                                <FormLabel>{editItem?.type === 'gst' ? 'GST Category' : 'Name'}</FormLabel>
                                <Input value={editItem?.roomType || editItem?.addOnName || editItem?.name || ''} isReadOnly />
                            </FormControl>
                            <FormControl>
                                <FormLabel>{editItem?.type === 'gst' ? 'GST Percentage' : 'Price'}</FormLabel>
                                <Input
                                    value={editItem?.costPerDay || editItem?.cost || editItem?.value || ''}
                                    onChange={(e) => setEditItem({ ...editItem, [editItem.type === 'room' ? 'costPerDay' : editItem.type === 'addon' ? 'cost' : 'value']: e.target.value })}
                                />
                            </FormControl>
                        </VStack>
                    </ModalBody>
                    <ModalFooter>
                        <Button colorScheme="blue" mr={3} onClick={handleSave}>
                            Save
                        </Button>
                        <Button variant="ghost" onClick={onClose}>Cancel</Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </Box>
    );
};

export default Settings;