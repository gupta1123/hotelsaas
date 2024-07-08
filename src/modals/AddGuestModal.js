import React, { useState, useEffect } from 'react';
import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
    Button,
    FormControl,
    FormLabel,
    Input,
    Select,
    useToast,
    useColorModeValue
} from '@chakra-ui/react';

const AddGuestModal = ({ isOpen, onClose, onSave, guestData, bookingId, authToken }) => {
    const [formData, setFormData] = useState({
        title: '',
        age: '',
        firstName: '',
        lastName: '',
        phoneNumber: '',
        email: '',
        identificationType: '',
        identificationNumber: ''
    });
    const toast = useToast();

    useEffect(() => {
        if (guestData) {
            setFormData({
                title: guestData.title || '',
                age: guestData.age || '',
                firstName: guestData.firstName || '',
                lastName: guestData.lastName || '',
                phoneNumber: guestData.phoneNumber || '',
                email: guestData.email || '',
                identificationType: Object.keys(guestData.guestDocs || {})[0] || '',
                identificationNumber: Object.values(guestData.guestDocs || {})[0] || ''
            });
        } else {
            setFormData({
                title: '',
                age: '',
                firstName: '',
                lastName: '',
                phoneNumber: '',
                email: '',
                identificationType: '',
                identificationNumber: ''
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
    
            const body = guestData 
                ? {
                    ...formData,
                    bookingId: bookingId,
                    guestDocs: { [formData.identificationType]: formData.identificationNumber }
                  }
                : [{
                    ...formData,
                    bookingId: bookingId,
                    guestDocs: { [formData.identificationType]: formData.identificationNumber }
                  }];
    
            const response = await fetch(endpoint, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                },
                body: JSON.stringify(body)
            });
    
            if (!response.ok) {
                throw new Error('Failed to save guest');
            }
    
            toast({
                title: "Success",
                description: "Guest details saved successfully",
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
                description: "Failed to save guest details",
                status: "error",
                duration: 3000,
                isClosable: true
            });
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="xl">
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>{guestData ? 'Edit Guest' : 'Add Guest'}</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <FormControl mb={4}>
                        <FormLabel>Title</FormLabel>
                        <Select name="title" value={formData.title} onChange={handleInputChange}>
                            <option value="Mr.">Mr.</option>
                            <option value="Miss">Miss</option>
                            <option value="Mrs.">Mrs.</option>
                        </Select>
                    </FormControl>
                    <FormControl mb={4}>
                        <FormLabel>Age</FormLabel>
                        <Input name="age" type="number" value={formData.age} onChange={handleInputChange} />
                    </FormControl>
                    <FormControl mb={4}>
                        <FormLabel>First Name</FormLabel>
                        <Input name="firstName" value={formData.firstName} onChange={handleInputChange} />
                    </FormControl>
                    <FormControl mb={4}>
                        <FormLabel>Last Name</FormLabel>
                        <Input name="lastName" value={formData.lastName} onChange={handleInputChange} />
                    </FormControl>
                    <FormControl mb={4}>
                        <FormLabel>Phone Number</FormLabel>
                        <Input name="phoneNumber" value={formData.phoneNumber} onChange={handleInputChange} />
                    </FormControl>
                    <FormControl mb={4}>
                        <FormLabel>Email</FormLabel>
                        <Input name="email" type="email" value={formData.email} onChange={handleInputChange} />
                    </FormControl>
                    <FormControl mb={4}>
                        <FormLabel>Identification Type</FormLabel>
                        <Select name="identificationType" value={formData.identificationType} onChange={handleInputChange}>
                            <option value="Aadhaar Card">Aadhaar Card</option>
                            <option value="PAN Card">PAN Card</option>
                            <option value="Driving License">Driving License</option>
                            <option value="Passport">Passport</option>
                        </Select>
                    </FormControl>
                    <FormControl mb={4}>
                        <FormLabel>Identification Number</FormLabel>
                        <Input name="identificationNumber" value={formData.identificationNumber} onChange={handleInputChange} />
                    </FormControl>
                </ModalBody>
                <ModalFooter>
                    <Button variant="ghost" mr={3} onClick={onClose}>
                        Cancel
                    </Button>
                    <Button colorScheme="blue" onClick={handleSave}>
                        Save
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};

export default AddGuestModal;
