import React, { useState, useEffect } from 'react';
import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalCloseButton,
    ModalBody,
    ModalFooter,
    Button,
    useToast,
    Box,
    Text,
    VStack,
    Spinner,
} from '@chakra-ui/react';

const AddOffersModal = ({ isOpen, onClose, authToken, bookingId }) => {
    console.log('addoffer', bookingId)
    const [offers, setOffers] = useState([]);
    const [selectedOffers, setSelectedOffers] = useState([]);
    const [loading, setLoading] = useState(true);
    const toast = useToast();

    useEffect(() => {
        const fetchOffers = async () => {
            try {
                const response = await fetch('http://ec2-54-211-23-206.compute-1.amazonaws.com:8081/offers/getAll', {
                    headers: { 'Authorization': `Bearer ${authToken}` }
                });
                if (!response.ok) throw new Error('Failed to fetch offers');
                const data = await response.json();
                setOffers(data);
                console.log(data); // Console log the fetched data
            } catch (error) {
                toast({
                    title: "Error",
                    description: "Failed to fetch offers",
                    status: "error",
                    duration: 5000,
                    isClosable: true,
                });
            } finally {
                setLoading(false);
            }
        };

        if (isOpen) {
            fetchOffers();
        }
    }, [isOpen, authToken, toast]);

    const toggleOfferSelection = (offerId) => {
        setSelectedOffers((prevSelected) =>
            prevSelected.includes(offerId)
                ? prevSelected.filter((id) => id !== offerId)
                : [...prevSelected, offerId]
        );
    };

    const applySelectedOffers = async () => {
        if (selectedOffers.length === 0) {
            toast({
                title: "No Offer Selected",
                description: "Please select an offer to apply.",
                status: "warning",
                duration: 5000,
                isClosable: true,
            });
            return;
        }

        try {
            const response = await fetch(`http://ec2-54-211-23-206.compute-1.amazonaws.com:8081/reservation/updateOffer?bookingId=${bookingId}&offerId=${selectedOffers[0]}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${authToken}`
                }
            });
            if (!response.ok) throw new Error('Failed to apply offer');
            const data = await response.json();
            toast({
                title: "Offer Applied",
                description: "The selected offer has been applied successfully.",
                status: "success",
                duration: 5000,
                isClosable: true,
            });
            console.log(data); // Log the response data
            onClose(); // Close the modal after applying the offer
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to apply the offer",
                status: "error",
                duration: 5000,
                isClosable: true,
            });
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="xl">
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>Add Offers</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    {loading ? (
                        <Box display="flex" justifyContent="center" alignItems="center">
                            <Spinner />
                        </Box>
                    ) : (
                        <VStack align="stretch">
                            {offers.map((offer) => (
                                <Box
                                    key={offer.id}
                                    p={4}
                                    borderWidth={1}
                                    borderRadius="md"
                                    bg={selectedOffers.includes(offer.id) ? 'blue.100' : 'white'}
                                    cursor="pointer"
                                    onClick={() => toggleOfferSelection(offer.id)}
                                >
                                    <Text fontWeight="bold">Offer Code: {offer.code}</Text>
                                    <Text>Room Type: {offer.applicableRoomType}</Text>
                                    <Text>Discount Percentage: {offer.discountPercentage}%</Text>
                                    <Text>Min Booking Duration: {offer.minimumBookingDurationInDays} days</Text>
                                    <Text>Max Booking Duration: {offer.maximumBookingDurationInDays} days</Text>
                                </Box>
                            ))}
                        </VStack>
                    )}
                </ModalBody>
                <ModalFooter>
                    <Button onClick={onClose}>Close</Button>
                    <Button colorScheme="blue" ml={3} onClick={applySelectedOffers}>
                        Apply
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};

export default AddOffersModal;