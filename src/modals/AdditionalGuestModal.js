import React, { useState, useEffect } from 'react';
import {
    Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton,
    Button, FormControl, FormLabel, Input, Select, useToast, VStack, HStack, SimpleGrid,
    IconButton
} from '@chakra-ui/react';
import { FaUser, FaEnvelope, FaPhone, FaIdCard, FaBirthdayCake } from 'react-icons/fa';

const AdditionalGuestModal = ({ isOpen, onClose, guestData, bookingId, authToken, onSave }) => {
    const [formData, setFormData] = useState({
        title: '', firstName: '', lastName: '', email: '', phoneNumber: '', age: '',
        identificationType: '', identificationNumber: ''
    });
    const toast = useToast();

    useEffect(() => {
        if (guestData) {
            setFormData({
                title: guestData.title || '',
                firstName: guestData.firstName || '',
                lastName: guestData.lastName || '',
                email: guestData.email || '',
                phoneNumber: guestData.phoneNumber?.toString() || '',
                age: guestData.age?.toString() || '',
                identificationType: Object.keys(guestData.guestDocs || {})[0] || '',
                identificationNumber: Object.values(guestData.guestDocs || {})[0] || ''
            });
        }
    }, [guestData]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async () => {
        try {
            const endpoint = guestData
                ? `http://ec2-54-211-23-206.compute-1.amazonaws.com:8081/guests/editGuest?guestId=${guestData.guestId}`
                : 'http://ec2-54-211-23-206.compute-1.amazonaws.com:8081/guests/addList';

            const method = guestData ? 'PUT' : 'POST';
            const body = guestData ? formData : [formData];

            const response = await fetch(endpoint, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                },
                body: JSON.stringify({
                    ...formData,
                    bookingId: bookingId,
                    guestDocs: { [formData.identificationType]: formData.identificationNumber },
                    phoneNumber: parseInt(formData.phoneNumber),
                    age: parseInt(formData.age)
                })
            });

            if (!response.ok) throw new Error('Failed to save guest');

            toast({
                title: "Success",
                description: `Guest ${guestData ? 'updated' : 'added'} successfully`,
                status: "success",
                duration: 3000,
                isClosable: true
            });
            onSave();
            onClose();
        } catch (error) {
            console.error('Error saving guest:', error);
            toast({
                title: "Error",
                description: `Failed to ${guestData ? 'update' : 'add'} guest`,
                status: "error",
                duration: 3000,
                isClosable: true
            });
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="lg">
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>{guestData ? 'Edit Guest' : 'Add Guest'}</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <SimpleGrid columns={2} spacing={4}>
                        <FormControl>
                            <FormLabel>Title</FormLabel>
                            <Select name="title" value={formData.title} onChange={handleInputChange}>
                                <option value="Mr">Mr</option>
                                <option value="Mrs">Mrs</option>
                                <option value="Ms">Ms</option>
                                <option value="Dr">Dr</option>
                            </Select>
                        </FormControl>
                        <FormControl>
                            <FormLabel>Age</FormLabel>
                            <Input name="age" type="number" value={formData.age} onChange={handleInputChange} />
                        </FormControl>
                        <FormControl>
                            <FormLabel>First Name</FormLabel>
                            <Input name="firstName" value={formData.firstName} onChange={handleInputChange} />
                        </FormControl>
                        <FormControl>
                            <FormLabel>Last Name</FormLabel>
                            <Input name="lastName" value={formData.lastName} onChange={handleInputChange} />
                        </FormControl>
                        <FormControl>
                            <FormLabel>Phone Number</FormLabel>
                            <Input name="phoneNumber" value={formData.phoneNumber} onChange={handleInputChange} />
                        </FormControl>
                        <FormControl>
                            <FormLabel>Email</FormLabel>
                            <Input name="email" type="email" value={formData.email} onChange={handleInputChange} />
                        </FormControl>
                        <FormControl>
                            <FormLabel>Identification Type</FormLabel>
                            <Select name="identificationType" value={formData.identificationType} onChange={handleInputChange}>
                                <option value="Aadhaar Card">Aadhaar Card</option>
                                <option value="PAN Card">PAN Card</option>
                                <option value="Driving License">Driving License</option>
                                <option value="Passport">Passport</option>
                            </Select>
                        </FormControl>
                        <FormControl>
                            <FormLabel>Identification Number</FormLabel>
                            <Input name="identificationNumber" value={formData.identificationNumber} onChange={handleInputChange} />
                        </FormControl>
                    </SimpleGrid>
                </ModalBody>
                <ModalFooter>
                    <Button variant="ghost" mr={3} onClick={onClose}>Cancel</Button>
                    <Button colorScheme="blue" onClick={handleSave}>Save</Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};

export default AdditionalGuestModal;