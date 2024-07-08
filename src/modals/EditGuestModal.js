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
    VStack, HStack,
    useColorModeValue,
    useToast,
    Grid,
    GridItem
} from '@chakra-ui/react';
import { getData } from 'country-list';
import { Select as ReactSelect } from 'chakra-react-select';

const CountrySelect = ({ value, onChange }) => {
    const countries = getData().map(country => ({
        label: country.name,
        value: country.code
    }));

    const selectedOption = countries.find(option => option.label === value);

    return (
        <ReactSelect
            options={countries}
            value={selectedOption}
            onChange={(selectedOption) => onChange(selectedOption ? selectedOption.label : '')}
            placeholder="Search countries..."
            isClearable={true}
            isSearchable={true}
        />
    );
};

const EditGuestModal = ({ visible, onCancel, onSave, guestData, authToken }) => {
    const [formData, setFormData] = useState({});
    const toast = useToast();
    const bgColor = useColorModeValue('white', 'gray.800');
    const textColor = useColorModeValue('gray.800', 'white');
    const borderColor = useColorModeValue('gray.200', 'gray.600');

    useEffect(() => {
        if (guestData) {
            const nameParts = guestData.customerName ? guestData.customerName.split(' ') : [];

            setFormData({
                title: guestData.title || '',
                //customerName: guestData.customerName || '',
                firstName: nameParts[0] || '',
                lastName: nameParts[1] || '',
                email: guestData.email || '',
                phoneNumber: guestData.phoneNumber || '',
                address: guestData.address || '',
                city: guestData.city || '',
                state: guestData.state || '',
                country: guestData.country || '',
                age: guestData.age || '',
                idType: Object.keys(guestData.customerDocs || {})[0] || '',
                idNumber: Object.values(guestData.customerDocs || {})[0] || '',
            });
        }
    }, [guestData]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleCountryChange = (value) => {
        setFormData(prev => ({ ...prev, country: value }));
    };

    const handleSave = async (event) => {
        event.preventDefault();
        const payload = {
            ...formData,
            customerDocs: { [formData.idType]: formData.idNumber }
        };
        console.log('Payload:', JSON.stringify(payload));

        try {
            const response = await fetch(`http://ec2-54-211-23-206.compute-1.amazonaws.com:8081/customers/editCustomer?customerId=${guestData.custId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`,
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                throw new Error('Failed to update guest');
            }

            toast({
                title: "Success",
                description: "Guest details updated successfully",
                status: "success",
                duration: 3000,
                isClosable: true,
            });
            onSave(formData);
        } catch (error) {
            console.error('Error updating guest:', error);
            toast({
                title: "Error",
                description: "Failed to update guest details",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        }
    };


    return (
        <Modal isOpen={visible} onClose={onCancel} size="xl">
            <ModalOverlay />
            <ModalContent bg={bgColor} color={textColor}>
                <ModalHeader borderBottomWidth="1px" borderColor={borderColor}>Edit Guest Details</ModalHeader>
                <ModalCloseButton />
                <form onSubmit={handleSave}>
                    <ModalBody>
                        <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                            <GridItem colSpan={2}>
                                <FormControl>
                                    <FormLabel>Title and Name</FormLabel>
                                    <HStack>
                                        <Select name="title" value={formData.title} onChange={handleInputChange} width="30%">
                                            <option value="Mr.">Mr.</option>
                                            <option value="Ms.">Ms.</option>
                                            <option value="Mrs.">Mrs.</option>
                                        </Select>
                                        {/* <Input name="customerName" value={formData.customerName} onChange={handleInputChange} /> */}
                                        <Input name="firstName" value={formData.firstName} onChange={handleInputChange} />
                                        <Input name="lastName" value={formData.lastName} onChange={handleInputChange} />
                                    </HStack>
                                </FormControl>
                            </GridItem>

                            <GridItem>
                                <FormControl>
                                    <FormLabel>Email</FormLabel>
                                    <Input name="email" type="email" value={formData.email} onChange={handleInputChange} />
                                </FormControl>
                            </GridItem>
                            <GridItem>
                                <FormControl>
                                    <FormLabel>Phone Number</FormLabel>
                                    <Input name="phoneNumber" value={formData.phoneNumber} onChange={handleInputChange} isReadOnly />
                                </FormControl>
                            </GridItem>
                            <GridItem colSpan={2}>
                                <FormControl>
                                    <FormLabel>Address</FormLabel>
                                    <Input name="address" value={formData.address} onChange={handleInputChange} />
                                </FormControl>
                            </GridItem>
                            <GridItem>
                                <FormControl>
                                    <FormLabel>City</FormLabel>
                                    <Input name="city" value={formData.city} onChange={handleInputChange} />
                                </FormControl>
                            </GridItem>
                            <GridItem>
                                <FormControl>
                                    <FormLabel>State</FormLabel>
                                    <Input name="state" value={formData.state} onChange={handleInputChange} />
                                </FormControl>
                            </GridItem>
                            <GridItem>
                                <FormControl>
                                    <FormLabel>Country</FormLabel>
                                    <CountrySelect value={formData.country} onChange={handleCountryChange} />
                                </FormControl>
                            </GridItem>
                            <GridItem>
                                <FormControl>
                                    <FormLabel>Age</FormLabel>
                                    <Input name="age" type="number" value={formData.age} onChange={handleInputChange} />
                                </FormControl>
                            </GridItem>
                            <GridItem>
                                <FormControl>
                                    <FormLabel>ID Type</FormLabel>
                                    <Select name="idType" value={formData.idType} onChange={handleInputChange}>
                                        <option value="Aadhaar Card">Aadhaar Card</option>
                                        <option value="Driving Licence">Driving Licence</option>
                                        <option value="PAN Card">PAN Card</option>
                                        <option value="Passport">Passport</option>
                                    </Select>
                                </FormControl>
                            </GridItem>
                            <GridItem>
                                <FormControl>
                                    <FormLabel>Identification Number</FormLabel>
                                    <Input name="idNumber" value={formData.idNumber} onChange={handleInputChange} />
                                </FormControl>
                            </GridItem>
                        </Grid>
                    </ModalBody>
                    <ModalFooter borderTopWidth="1px" borderColor={borderColor}>
                        <Button variant="ghost" mr={3} onClick={onCancel}>
                            Cancel
                        </Button>
                        <Button colorScheme="blue" type="submit">
                            Save Changes
                        </Button>
                    </ModalFooter>
                </form>
            </ModalContent>
        </Modal>
    );
};

export default EditGuestModal;